const App = {
    state: { user: null, page: 'login' },

    async init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                this.state.user = await api.me();
                this.go('dashboard');
            } catch { localStorage.removeItem('token'); this.go('login'); }
        } else { this.go('login'); }
        document.getElementById('loading-screen')?.remove();
    },

    go(page) {
        this.state.page = page;
        const pages = { login: () => this.pageLogin(), dashboard: () => this.pageDashboard(), parts: () => this.pageParts(), movements: () => this.pageMovements(), reports: () => this.pageReports() };
        (pages[page] || pages.login)();
    },

    sidebar(active) {
        const items = [
            { id:'dashboard', icon:'fa-chart-line', label:'Dashboard' },
            { id:'parts', icon:'fa-cogs', label:'Catálogo' },
            { id:'movements', icon:'fa-exchange-alt', label:'Movimentações' },
            { id:'reports', icon:'fa-chart-bar', label:'Relatórios' },
        ];
        return `
        <aside class="w-60 bg-slate-900 text-white flex flex-col h-screen sticky top-0 flex-shrink-0">
            <div class="p-5 border-b border-slate-800">
                <h2 class="text-lg font-bold flex items-center gap-2"><i class="fas fa-box-open text-blue-400"></i> AutoPart</h2>
                <p class="text-[10px] text-slate-500 mt-1">Sistema Distribuído</p>
            </div>
            <nav class="flex-1 p-3 space-y-1">
                ${items.map(i => `
                    <button onclick="App.go('${i.id}')" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${active===i.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}">
                        <i class="fas ${i.icon} w-5"></i> ${i.label}
                    </button>
                `).join('')}
            </nav>
            <div class="p-3 border-t border-slate-800">
                <div class="px-4 py-2 mb-2"><span class="text-xs text-slate-500">${this.state.user?.nome || ''}</span><br><span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">${this.state.user?.perfil || ''}</span></div>
                <button onclick="App.logout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"><i class="fas fa-sign-out-alt w-5"></i> Sair</button>
            </div>
        </aside>`;
    },

    // ============ LOGIN ============
    pageLogin() {
        document.getElementById('app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30"><i class="fas fa-cog text-white text-2xl"></i></div>
                    <h1 class="text-2xl font-bold text-slate-900">AutoPart Sync</h1>
                    <p class="text-slate-500 text-sm">Sistema Distribuído de Autopeças</p>
                </div>
                <form id="login-form" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                        <input type="email" id="email" required class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="usuario@empresa.com">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <input type="password" id="password" required class="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••">
                    </div>
                    <button type="submit" id="login-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">Entrar no Sistema</button>
                </form>
            </div>
        </div>`;
        document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            try {
                btn.disabled = true; btn.innerHTML = '<span class="loader"></span> Verificando...';
                const res = await api.login({ email: document.getElementById('email').value, password: document.getElementById('password').value });
                localStorage.setItem('token', res.token);
                this.state.user = res.user;
                this.go('dashboard');
            } catch (err) { alert(err.mensagem || 'Falha na autenticação'); }
            finally { btn.disabled = false; btn.innerHTML = 'Entrar no Sistema'; }
        };
    },

    // ============ DASHBOARD ============
    async pageDashboard() {
        document.getElementById('app').innerHTML = `<div class="flex min-h-screen">${this.sidebar('dashboard')}<main class="flex-1 p-8 overflow-auto"><h1 class="text-3xl font-bold mb-6">Dashboard</h1><div id="dash-content" class="space-y-6"><p class="text-slate-400">Carregando...</p></div></main></div>`;
        try {
            const [parts, lowStock, history] = await Promise.all([api.getParts(), api.getLowStock(), api.getHistory()]);
            const partsData = parts.data || parts;
            const lowData = (lowStock.data || lowStock) || [];
            const histData = (history.data || history) || [];

            const entradas = histData.filter(m => m.tipo === 'entrada').length;
            const saidas = histData.filter(m => m.tipo === 'saida').length;

            document.getElementById('dash-content').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3 mb-1"><div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><i class="fas fa-boxes"></i></div><span class="text-slate-500 text-sm">Total Peças</span></div>
                    <p class="text-3xl font-bold">${partsData.length || 0}</p>
                </div>
                <div class="bg-white p-5 rounded-xl border ${lowData.length > 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200'} shadow-sm">
                    <div class="flex items-center gap-3 mb-1"><div class="p-2 bg-amber-50 text-amber-600 rounded-lg"><i class="fas fa-exclamation-triangle"></i></div><span class="text-slate-500 text-sm">Estoque Baixo</span></div>
                    <p class="text-3xl font-bold">${lowData.length || 0}</p>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3 mb-1"><div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><i class="fas fa-sync"></i></div><span class="text-slate-500 text-sm">Movimentações</span></div>
                    <p class="text-3xl font-bold">${histData.length || 0}</p>
                </div>
            </div>

            ${lowData.length > 0 ? `<div class="bg-amber-50 border border-amber-200 rounded-xl p-4"><h3 class="font-bold text-amber-800 mb-2"><i class="fas fa-bell mr-2"></i>Alertas de Estoque</h3><div class="space-y-2">${lowData.map(p => `<div class="flex justify-between items-center bg-white p-3 rounded-lg"><span class="font-medium">${p.codigo} - ${p.nome}</span><span class="text-sm text-red-600 font-bold">${p.estoque_atual}/${p.estoque_minimo} un</span></div>`).join('')}</div></div>` : ''}

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold mb-4">Últimas Movimentações</h3>
                    <div class="space-y-2">${histData.slice(0,8).map(m => `
                        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div class="flex items-center gap-2"><i class="fas ${m.tipo==='entrada'?'fa-arrow-down text-emerald-500':'fa-arrow-up text-red-500'}"></i><span class="text-sm font-medium">${m.peca_nome||'N/A'}</span></div>
                            <span class="text-sm font-bold ${m.tipo==='entrada'?'text-emerald-600':'text-red-600'}">${m.tipo==='entrada'?'+':'-'}${m.quantidade}</span>
                        </div>`).join('') || '<p class="text-slate-400 text-sm">Nenhuma movimentação</p>'}</div>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold mb-4">Movimentações por Tipo</h3>
                    <canvas id="chart-movements" height="200"></canvas>
                </div>
            </div>`;

            if (typeof Chart !== 'undefined') {
                const ctx = document.getElementById('chart-movements');
                if (ctx) {
                    new Chart(ctx, {
                        type: 'doughnut',
                        data: { labels: ['Entradas', 'Saídas'], datasets: [{ data: [entradas, saidas], backgroundColor: ['#10b981', '#ef4444'] }] },
                        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }
            }
        } catch(e) {
            console.error('Dashboard error:', e);
            document.getElementById('dash-content').innerHTML = `<p class="text-red-500">Erro ao carregar dados: ${e.message || 'Desconhecido'}</p>`;
        }
    },

    // ============ PARTS ============
    async pageParts() {
        document.getElementById('app').innerHTML = `<div class="flex min-h-screen">${this.sidebar('parts')}<main class="flex-1 p-8 overflow-auto">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-bold">Catálogo de Peças</h1>
                <button onclick="App.showAddPartModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all"><i class="fas fa-plus"></i> Nova Peça</button>
            </div>
            <div class="flex gap-3 mb-6">
                <input type="text" id="search-input" placeholder="Buscar por nome ou código..." class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
                <button onclick="App.searchParts()" class="bg-slate-200 hover:bg-slate-300 px-4 py-2.5 rounded-lg font-medium transition-all"><i class="fas fa-search"></i></button>
            </div>
            <div id="parts-table" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><p class="p-6 text-slate-400">Carregando...</p></div>
        </main></div>`;
        try {
            const res = await api.getParts();
            const parts = res.data || res;
            const tableRows = parts.map(p => `
                <tr class="border-t border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-3 font-mono text-sm">${p.codigo}</td>
                    <td class="px-4 py-3 font-medium">${p.nome}</td>
                    <td class="px-4 py-3 text-sm">${p.categoria || '-'}</td>
                    <td class="px-4 py-3 text-sm text-right">${p.estoque_atual}</td>
                    <td class="px-4 py-3 text-sm text-right font-medium">${p.preco_venda.toFixed(2)}</td>
                    <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full ${p.estoque_atual <= p.estoque_minimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${p.estoque_atual <= p.estoque_minimo ? 'Baixo' : 'OK'}</span></td>
                </tr>`).join('');
            document.getElementById('parts-table').innerHTML = `<table class="w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-3 text-left font-medium text-slate-600">Código</th><th class="px-4 py-3 text-left font-medium text-slate-600">Nome</th><th class="px-4 py-3 text-left font-medium text-slate-600">Categoria</th><th class="px-4 py-3 text-right font-medium text-slate-600">Estoque</th><th class="px-4 py-3 text-right font-medium text-slate-600">Preço</th><th class="px-4 py-3 text-left font-medium text-slate-600">Status</th></tr></thead><tbody>${tableRows}</tbody></table>`;
        } catch(e) { console.error(e); document.getElementById('parts-table').innerHTML = '<p class="p-6 text-red-500">Erro ao carregar peças</p>'; }
    },

    async searchParts() {
        const query = document.getElementById('search-input').value;
        try {
            const res = await api.getParts({ busca: query });
            const parts = res.data || res;
            const tableRows = parts.map(p => `
                <tr class="border-t border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-3 font-mono text-sm">${p.codigo}</td>
                    <td class="px-4 py-3 font-medium">${p.nome}</td>
                    <td class="px-4 py-3 text-sm">${p.categoria || '-'}</td>
                    <td class="px-4 py-3 text-sm text-right">${p.estoque_atual}</td>
                    <td class="px-4 py-3 text-sm text-right font-medium">${p.preco_venda.toFixed(2)}</td>
                    <td class="px-4 py-3"><span class="text-xs px-2 py-1 rounded-full ${p.estoque_atual <= p.estoque_minimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${p.estoque_atual <= p.estoque_minimo ? 'Baixo' : 'OK'}</span></td>
                </tr>`).join('');
            document.getElementById('parts-table').innerHTML = `<table class="w-full text-sm"><thead class="bg-slate-50"><tr><th class="px-4 py-3 text-left font-medium text-slate-600">Código</th><th class="px-4 py-3 text-left font-medium text-slate-600">Nome</th><th class="px-4 py-3 text-left font-medium text-slate-600">Categoria</th><th class="px-4 py-3 text-right font-medium text-slate-600">Estoque</th><th class="px-4 py-3 text-right font-medium text-slate-600">Preço</th><th class="px-4 py-3 text-left font-medium text-slate-600">Status</th></tr></thead><tbody>${tableRows}</tbody></table>`;
        } catch(e) { console.error(e); alert('Erro ao buscar'); }
    },

    // ============ MOVEMENTS ============
    async pageMovements() {
        document.getElementById('app').innerHTML = `<div class="flex min-h-screen">${this.sidebar('movements')}<main class="flex-1 p-8 overflow-auto"><h1 class="text-3xl font-bold mb-6">Movimentações</h1><div id="mov-content" class="space-y-6"><p class="text-slate-400">Carregando...</p></div></main></div>`;
        try {
            const [parts, history] = await Promise.all([api.getParts(), api.getHistory()]);
            const partsList = (parts.data || parts);
            const histList = (history.data || history) || [];
            
            const historyRows = histList.map(m => `
                <tr class="border-t border-slate-100 hover:bg-slate-50">
                    <td class="px-4 py-3">${new Date(m.criado_em).toLocaleString('pt-BR')}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded text-xs font-bold ${m.tipo==='entrada'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}">${m.tipo.toUpperCase()}</span></td>
                    <td class="px-4 py-3 font-medium">${m.peca_nome || 'N/A'}</td>
                    <td class="px-4 py-3 text-sm text-right font-bold ${m.tipo==='entrada'?'text-emerald-600':'text-red-600'}">${m.tipo==='entrada'?'+':'-'}${m.quantidade}</td>
                    <td class="px-4 py-3 text-sm">${m.motivo || '-'}</td>
                </tr>`).join('');

            document.getElementById('mov-content').innerHTML = `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-sm">
                    <thead class="bg-slate-50"><tr><th class="px-4 py-3 text-left font-medium text-slate-600">Data</th><th class="px-4 py-3 text-left font-medium text-slate-600">Tipo</th><th class="px-4 py-3 text-left font-medium text-slate-600">Peça</th><th class="px-4 py-3 text-right font-medium text-slate-600">Quantidade</th><th class="px-4 py-3 text-left font-medium text-slate-600">Motivo</th></tr></thead>
                    <tbody>${historyRows || '<tr><td colspan="5" class="px-4 py-6 text-center text-slate-400">Nenhuma movimentação registrada</td></tr>'}</tbody>
                </table>
            </div>`;
        } catch(e) { console.error(e); document.getElementById('mov-content').innerHTML = '<p class="text-red-500">Erro ao carregar movimentações</p>'; }
    },

    // ============ REPORTS ============
    async pageReports() {
        document.getElementById('app').innerHTML = `<div class="flex min-h-screen">${this.sidebar('reports')}<main class="flex-1 p-8 overflow-auto"><h1 class="text-3xl font-bold mb-6">Relatórios</h1><div id="reports-content" class="space-y-6"><p class="text-slate-400">Carregando...</p></div></main></div>`;
        try {
            const [parts, history] = await Promise.all([api.getParts(), api.getHistory()]);
            const partsData = parts.data || parts;
            const histData = (history.data || history) || [];

            const entradas = histData.filter(m => m.tipo === 'entrada').length;
            const saidas = histData.filter(m => m.tipo === 'saida').length;

            document.getElementById('reports-content').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold mb-4">Total de Movimentações</h3>
                    <canvas id="chart-mov-bar" height="250"></canvas>
                </div>
                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold mb-4">Movimentações por Tipo</h3>
                    <canvas id="chart-mov-doughnut" height="250"></canvas>
                </div>
            </div>`;

            if (typeof Chart !== 'undefined') {
                const ctxBar = document.getElementById('chart-mov-bar');
                const ctxDoughnut = document.getElementById('chart-mov-doughnut');
                if (ctxBar) {
                    new Chart(ctxBar, {
                        type: 'bar', data: { labels: ['Entradas', 'Saídas'], datasets: [{ label: 'Quantidade', data: [entradas, saidas], backgroundColor: ['#10b981', '#ef4444'] }] }, options: { responsive: true, plugins: { legend: { display: false } } }
                    });
                }
                if (ctxDoughnut) {
                    new Chart(ctxDoughnut, {
                        type: 'doughnut', data: { labels: ['Entradas', 'Saídas'], datasets: [{ data: [entradas, saidas], backgroundColor: ['#10b981', '#ef4444'] }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
                    });
                }
            }
        } catch(e) { console.error(e); document.getElementById('reports-content').innerHTML = '<p class="text-red-500">Erro ao carregar relatórios</p>'; }
    },

    logout() { localStorage.removeItem('token'); this.state.user = null; this.go('login'); }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
