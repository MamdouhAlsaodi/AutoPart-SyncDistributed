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
            const histData = history.data || history;

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
                    <div class="space-y-2">${(histData || []).slice(0,8).map(m => `
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

            // Chart.js
            const entradas = (histData||[]).filter(m=>m.tipo==='entrada').length;
            const saidas = (histData||[]).filter(m=>m.tipo==='saida').length;
            new Chart(document.getElementById('chart-movements'), {
                type: 'doughnut',
                data: { labels: ['Entradas', 'Saídas'], datasets: [{ data: [entradas, saidas], backgroundColor: ['#10b981', '#ef4444'] }] },
                options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
            });
        } catch(e) { console.error(e); document.getElementById('dash-content').innerHTML = '<p class="text-red-500">Erro ao carregar dados. Verifique a conexão com o servidor.</p>'; }
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
            <div id="modal-container"></div>
        </main></div>`;
        await this.loadParts();
    },

    async loadParts(filters) {
        try {
            const res = await api.getParts(filters);
            const parts = res.data || res;
            document.getElementById('parts-table').innerHTML = parts.length === 0 ? '<p class="p-6 text-slate-400">Nenhuma peça encontrada.</p>' : `
            <table class="w-full">
                <thead><tr class="bg-slate-50 border-b border-slate-200">
                    <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Código</th>
                    <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Nome</th>
                    <th class="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Categoria</th>
                    <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Preço</th>
                    <th class="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Estoque</th>
                    <th class="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr></thead>
                <tbody>${parts.map(p => `
                    <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td class="px-4 py-3 text-sm font-mono font-medium text-blue-600">${p.codigo}</td>
                        <td class="px-4 py-3 text-sm font-medium">${p.nome}</td>
                        <td class="px-4 py-3 text-sm text-slate-500">${p.categoria||'—'}</td>
                        <td class="px-4 py-3 text-sm text-right font-medium">R$ ${Number(p.preco_venda).toFixed(2)}</td>
                        <td class="px-4 py-3 text-sm text-right font-bold ${p.estoque_atual<=p.estoque_minimo?'text-red-600':'text-slate-900'}">${p.estoque_atual}</td>
                        <td class="px-4 py-3 text-center"><span class="text-[10px] font-bold px-2 py-1 rounded-full ${p.estoque_atual<=p.estoque_minimo?'bg-red-100 text-red-600':'bg-emerald-100 text-emerald-600'}">${p.estoque_atual<=p.estoque_minimo?'BAIXO':'OK'}</span></td>
                    </tr>`).join('')}</tbody>
            </table>`;
        } catch(e) { document.getElementById('parts-table').innerHTML = '<p class="p-6 text-red-500">Erro ao carregar peças.</p>'; }
    },

    searchParts() { this.loadParts({ busca: document.getElementById('search-input')?.value }); },

    showAddPartModal() {
        document.getElementById('modal-container').innerHTML = `
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onclick="if(event.target===this)document.getElementById('modal-container').innerHTML=''">
            <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <h2 class="text-xl font-bold mb-4">Cadastrar Nova Peça</h2>
                <form id="add-part-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium mb-1">Código</label><input name="codigo" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Nome</label><input name="nome" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Descrição</label><input name="descricao" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="block text-sm font-medium mb-1">Preço Custo (R$)</label><input name="preco_custo" type="number" step="0.01" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Preço Venda (R$)</label><input name="preco_venda" type="number" step="0.01" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div><label class="block text-sm font-medium mb-1">Estoque</label><input name="estoque_atual" type="number" value="0" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Mínimo</label><input name="estoque_minimo" type="number" value="5" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Categoria ID</label><input name="categoria_id" type="number" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                    </div>
                    <div class="flex gap-3 pt-2">
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all">Cadastrar</button>
                        <button type="button" onclick="document.getElementById('modal-container').innerHTML=''" class="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition-all">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>`;
        document.getElementById('add-part-form').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd);
            data.preco_custo = parseFloat(data.preco_custo);
            data.preco_venda = parseFloat(data.preco_venda);
            data.estoque_atual = parseInt(data.estoque_atual);
            data.estoque_minimo = parseInt(data.estoque_minimo);
            data.categoria_id = data.categoria_id ? parseInt(data.categoria_id) : null;
            data.fornecedor_id = null;
            try {
                await api.createPart(data);
                document.getElementById('modal-container').innerHTML = '';
                this.loadParts();
            } catch(err) { alert(err.mensagem || 'Erro ao cadastrar'); }
        };
    },

    // ============ MOVEMENTS ============
    async pageMovements() {
        document.getElementById('app').innerHTML = `<div class="flex min-h-screen">${this.sidebar('movements')}<main class="flex-1 p-8 overflow-auto">
            <h1 class="text-3xl font-bold mb-6">Movimentações de Estoque</h1>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold text-emerald-600 mb-4 flex items-center gap-2"><i class="fas fa-arrow-down"></i> Registrar Entrada</h3>
                    <form id="entry-form" class="space-y-4">
                        <div><label class="block text-sm font-medium mb-1">ID da Peça</label><input name="peca_id" type="number" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Quantidade</label><input name="quantidade" type="number" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Motivo</label><input name="motivo" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Compra fornecedor"></div>
                        <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-all">Registrar Entrada</button>
                    </form>
                </div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold text-red-600 mb-4 flex items-center gap-2"><i class="fas fa-arrow-up"></i> Registrar Saída</h3>
                    <form id="exit-form" class="space-y-4">
                        <div><label class="block text-sm font-medium mb-1">ID da Peça</label><input name="peca_id" type="number" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Quantidade</label><input name="quantidade" type="number" required class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"></div>
                        <div><label class="block text-sm font-medium mb-1">Motivo</label><input name="motivo" class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Venda ao cliente"></div>
                        <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-all">Registrar Saída</button>
                    </form>
                </div>
            </div>
            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 class="font-bold mb-4">Histórico de Movimentações</h3>
                <div id="mov-history" class="space-y-2"><p class="text-slate-400 text-sm">Carregando...</p></div>
            </div>
        </main></div>`;

        // Forms
        const mkHandler = (type) => async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = Object.fromEntries(fd);
            data.quantidade = parseInt(data.quantidade);
            data.peca_id = parseInt(data.peca_id);
            data.usuario_id = this.state.user?.id;
            try {
                await (type === 'entrada' ? api.recordEntry(data) : api.recordExit(data));
                alert(`${type === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
                e.target.reset();
                this.loadMovHistory();
            } catch(err) { alert(err.mensagem || 'Erro na operação'); }
        };
        document.getElementById('entry-form').onsubmit = mkHandler('entrada');
        document.getElementById('exit-form').onsubmit = mkHandler('saida');
        this.loadMovHistory();
    },

    async loadMovHistory() {
        try {
            const res = await api.getHistory();
            const hist = res.data || res;
            document.getElementById('mov-history').innerHTML = hist.length === 0 ? '<p class="text-slate-400 text-sm">Nenhuma movimentação registrada.</p>' : `
            <table class="w-full"><thead><tr class="border-b border-slate-200">
                <th class="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Tipo</th>
                <th class="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Peça</th>
                <th class="text-right px-3 py-2 text-xs font-medium text-slate-500 uppercase">Qtd</th>
                <th class="text-left px-3 py-2 text-xs font-medium text-slate-500 uppercase">Motivo</th>
            </tr></thead><tbody>
            ${hist.slice(0,20).map(m => `<tr class="border-b border-slate-100">
                <td class="px-3 py-2"><span class="text-xs font-bold px-2 py-1 rounded-full ${m.tipo==='entrada'?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}">${m.tipo}</span></td>
                <td class="px-3 py-2 text-sm">${m.peca_nome||'ID:'+m.peca_id}</td>
                <td class="px-3 py-2 text-sm text-right font-bold">${m.quantidade}</td>
                <td class="px-3 py-2 text-sm text-slate-500">${m.motivo||'—'}</td>
            </tr>`).join('')}</tbody></table>`;
        } catch(e) { document.getElementById('mov-history').innerHTML = '<p class="text-red-500 text-sm">Erro ao carregar histórico.</p>'; }
    },

    // ============ REPORTS ============
    async pageReports() {
        document.getElementById('app').innerHTML = `<div class="flex min-h-screen">${this.sidebar('reports')}<main class="flex-1 p-8 overflow-auto">
            <h1 class="text-3xl font-bold mb-6">Relatórios</h1>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold mb-4">Estoque Atual</h3><canvas id="chart-stock"></canvas></div>
                <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"><h3 class="font-bold mb-4">Movimentações (Entradas vs Saídas)</h3><canvas id="chart-mov-bar"></canvas></div>
            </div>
        </main></div>`;
        try {
            const [partsRes, histRes] = await Promise.all([api.getParts(), api.getHistory()]);
            const parts = partsRes.data || partsRes;
            const hist = histRes.data || histRes;

            // Stock Chart
            new Chart(document.getElementById('chart-stock'), {
                type: 'bar',
                data: { labels: parts.map(p => p.codigo), datasets: [{ label: 'Estoque Atual', data: parts.map(p => p.estoque_atual), backgroundColor: parts.map(p => p.estoque_atual <= p.estoque_minimo ? '#ef4444' : '#3b82f6') }] },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });

            // Movements Bar Chart
            const entradas = (hist||[]).filter(m=>m.tipo==='entrada').reduce((s,m)=>s+m.quantidade,0);
            const saidas = (hist||[]).filter(m=>m.tipo==='saida').reduce((s,m)=>s+m.quantidade,0);
            new Chart(document.getElementById('chart-mov-bar'), {
                type: 'bar',
                data: { labels: ['Entradas', 'Saídas'], datasets: [{ label: 'Quantidade', data: [entradas, saidas], backgroundColor: ['#10b981', '#ef4444'] }] },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        } catch(e) { console.error(e); }
    },

    logout() { localStorage.removeItem('token'); this.state.user = null; this.go('login'); }
};
