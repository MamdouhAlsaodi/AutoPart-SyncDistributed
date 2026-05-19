const App = {
    state: { user: null, page: 'login' },

    async init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                this.state.user = await api.me();
                this.go('dashboard');
                // Auto seed database if empty
                if (this.state.user?.perfil === 'admin') {
                    await this.autoSeedIfNeeded();
                }
            } catch { localStorage.removeItem('token'); this.go('login'); }
        } else { this.go('login'); }
        document.getElementById('loading-screen')?.remove();
    },

    async autoSeedIfNeeded() {
        try {
            const [partsRes, historyRes] = await Promise.all([
                api.getParts(),
                api.getHistory()
            ]);
            const partsList = partsRes.data || partsRes || [];
            const historyList = historyRes.data || historyRes || [];

            if (historyList.length === 0) {
                console.log("AutoPart-SyncDistributed: Initializing client-side database auto-seeding...");

                // 1. Categories
                const cats = await api.getCategories();
                const requiredCats = ['Motor', 'Freios', 'Elétrica', 'Suspensão', 'Transmissão'];
                for (const catName of requiredCats) {
                    if (!cats.some(c => c.nome.toLowerCase() === catName.toLowerCase())) {
                        try {
                            const createCat = await api.createCategory({ nome: catName });
                            const newCat = createCat.data || createCat;
                            if (newCat && newCat._id) cats.push(newCat);
                        } catch (err) { console.error('Error seeding category:', catName, err); }
                    }
                }

                // 2. Suppliers
                const sups = await api.getSuppliers();
                const requiredSups = [
                    { nome: 'Distribuidora Bosch Brasil', cnpj: '11.111.111/0001-11', email: 'vendas@bosch.com.br', telefone: '(11) 4004-1111' },
                    { nome: 'Fremax Sistemas de Freio', cnpj: '22.222.222/0001-22', email: 'contato@fremax.com.br', telefone: '(47) 3444-2222' },
                    { nome: 'Nakasa Autopeças', cnpj: '33.333.333/0001-33', email: 'comercial@nakasa.com.br', telefone: '(11) 5555-3333' }
                ];
                for (const sup of requiredSups) {
                    if (!sups.some(s => s.nome.toLowerCase() === sup.nome.toLowerCase())) {
                        try {
                            const createSup = await api.createSupplier(sup);
                            const newSup = createSup.data || createSup;
                            if (newSup && newSup._id) sups.push(newSup);
                        } catch (err) { console.error('Error seeding supplier:', sup.nome, err); }
                    }
                }

                // 3. Users
                const users = await api.getUsers();
                const requiredUsers = [
                    { nome: 'Carlos Silva', email: 'carlos.operador@autopecas.com', password: 'carlospassword', perfil: 'operador' },
                    { nome: 'Ana Souza', email: 'ana.consulta@autopecas.com', password: 'anapassword', perfil: 'consulta' },
                    { nome: 'José Oliveira', email: 'jose.gerente@autopecas.com', password: 'josepassword', perfil: 'admin' },
                    { nome: 'Mariana Costa', email: 'mariana.vendas@autopecas.com', password: 'marianapassword', perfil: 'operador' },
                    { nome: 'Ricardo Santos', email: 'ricardo.auditor@autopecas.com', password: 'ricardopassword', perfil: 'consulta' }
                ];
                for (const user of requiredUsers) {
                    if (!users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
                        try {
                            const createUser = await api.createUser(user);
                            if (createUser && createUser._id) users.push(createUser);
                        } catch (err) { console.error('Error seeding user:', user.nome, err); }
                    }
                }

                // Refresh users to get correct IDs
                const freshUsers = await api.getUsers();

                // 4. Parts
                const catMotor = cats.find(c => c.nome.toLowerCase() === 'motor') || cats[0];
                const catFreios = cats.find(c => c.nome.toLowerCase() === 'freios') || cats[0];
                const catEletrica = cats.find(c => c.nome.toLowerCase() === 'elétrica') || cats[0];
                const catSuspensao = cats.find(c => c.nome.toLowerCase() === 'suspensão') || cats[0];
                const catTransmissao = cats.find(c => c.nome.toLowerCase() === 'transmissão') || cats[0];

                const supBosch = sups.find(s => s.nome.toLowerCase().includes('bosch')) || sups[0];
                const supFremax = sups.find(s => s.nome.toLowerCase().includes('fremax')) || sups[0];
                const supNakasa = sups.find(s => s.nome.toLowerCase().includes('nakasa')) || sups[0];

                const requiredParts = [
                    { codigo: 'PF-001', nome: 'Pastilha de Freio Bosch', descricao: 'Pastilha de freio cerâmica premium', preco_custo: 95.00, preco_venda: 189.90, estoque_atual: 18, estoque_minimo: 10, categoria_id: catFreios._id, fornecedor_id: supBosch._id },
                    { codigo: 'DF-002', nome: 'Disco de Freio Fremax', descricao: 'Disco de freio dianteiro ventilado', preco_custo: 120.00, preco_venda: 249.00, estoque_atual: 4, estoque_minimo: 6, categoria_id: catFreios._id, fornecedor_id: supBosch._id },
                    { codigo: 'BA-003', nome: 'Bomba de Água Urba', descricao: 'Bomba de água para motores flex', preco_custo: 90.00, preco_venda: 198.50, estoque_atual: 3, estoque_minimo: 5, categoria_id: catMotor._id, fornecedor_id: supFremax._id },
                    { codigo: 'CD-004', nome: 'Correia Dentada Gates', descricao: 'Correia sincronizadora reforçada', preco_custo: 40.00, preco_venda: 85.00, estoque_atual: 25, estoque_minimo: 8, categoria_id: catMotor._id, fornecedor_id: supFremax._id },
                    { codigo: 'FO-005', nome: 'Filtro de Óleo Fram', descricao: 'Filtro de óleo blindado de alta vazão', preco_custo: 15.00, preco_venda: 34.90, estoque_atual: 42, estoque_minimo: 15, categoria_id: catMotor._id, fornecedor_id: supBosch._id },
                    { codigo: 'AL-006', nome: 'Alternador Valeo 12V', descricao: 'Alternador de 90 amperes completo', preco_custo: 420.00, preco_venda: 850.00, estoque_atual: 2, estoque_minimo: 3, categoria_id: catEletrica._id, fornecedor_id: supFremax._id },
                    { codigo: 'BT-007', nome: 'Bateria Moura 60Ah', descricao: 'Bateria Moura livre de manutenção', preco_custo: 230.00, preco_venda: 489.90, estoque_atual: 12, estoque_minimo: 5, categoria_id: catEletrica._id, fornecedor_id: supNakasa._id },
                    { codigo: 'VI-008', nome: 'Vela de Ignição NGK', descricao: 'Vela de ignição Iridium resistiva', preco_custo: 12.00, preco_venda: 29.90, estoque_atual: 64, estoque_minimo: 20, categoria_id: catEletrica._id, fornecedor_id: supNakasa._id },
                    { codigo: 'AM-009', nome: 'Amortecedor Monroe', descricao: 'Amortecedor dianteiro pressurizado a gás', preco_custo: 180.00, preco_venda: 389.00, estoque_atual: 5, estoque_minimo: 8, categoria_id: catSuspensao._id, fornecedor_id: supFremax._id },
                    { codigo: 'PV-010', nome: 'Pivô de Suspensão Nakata', descricao: 'Pivô da bandeja de suspension dianteira', preco_custo: 50.00, preco_venda: 110.00, estoque_atual: 14, estoque_minimo: 6, categoria_id: catSuspensao._id, fornecedor_id: supBosch._id },
                    { codigo: 'KE-011', nome: 'Kit de Embreagem LUK', descricao: 'Kit com platô, disco e rolamento', preco_custo: 310.00, preco_venda: 620.00, estoque_atual: 2, estoque_minimo: 4, categoria_id: catTransmissao._id, fornecedor_id: supFremax._id },
                    { codigo: 'JH-012', nome: 'Junta Homocinética Cofap', descricao: 'Junta homocinética lado roda dianteiro', preco_custo: 80.00, preco_venda: 175.00, estoque_atual: 8, estoque_minimo: 4, categoria_id: catTransmissao._id, fornecedor_id: supBosch._id },
                    { codigo: 'FA-013', nome: 'Filtro de Ar Tecfil', descricao: 'Filtro de ar do motor lavável', preco_custo: 18.00, preco_venda: 42.00, estoque_atual: 30, estoque_minimo: 10, categoria_id: catMotor._id, fornecedor_id: supBosch._id },
                    { codigo: 'RD-014', nome: 'Radiador Denso', descricao: 'Radiador de água de alumínio brasado', preco_custo: 200.00, preco_venda: 410.00, estoque_atual: 1, estoque_minimo: 2, categoria_id: catMotor._id, fornecedor_id: supBosch._id },
                    { codigo: 'SA-015', nome: 'Sensor de ABS Bosch', descricao: 'Sensor de velocidade ABS roda dianteira', preco_custo: 70.00, preco_venda: 145.00, estoque_atual: 7, estoque_minimo: 4, categoria_id: catEletrica._id, fornecedor_id: supBosch._id }
                ];

                const parts = [...partsList];
                for (const p of requiredParts) {
                    if (!parts.some(x => x.codigo === p.codigo)) {
                        try {
                            const createPart = await api.createPart(p);
                            const newPart = createPart.data || createPart;
                            if (newPart && newPart._id) parts.push(newPart);
                        } catch (err) { console.error('Error seeding part:', p.nome, err); }
                    }
                }

                // 5. Movements
                const opUser = freshUsers.find(u => u.perfil === 'operador') || this.state.user;
                const adminUser = freshUsers.find(u => u.perfil === 'admin') || this.state.user;

                const movementsToCreate = [
                    { peca_codigo: 'PF-001', tipo: 'entrada', quantidade: 20, motivo: 'Compra de estoque do distribuidor Bosch Brasil', user: opUser },
                    { peca_codigo: 'BT-007', tipo: 'saida', quantidade: 2, motivo: 'Venda para oficina mecânica AutoCenter', user: opUser },
                    { peca_codigo: 'FO-005', tipo: 'entrada', quantidade: 50, motivo: 'Reposição de estoque via importadora', user: adminUser },
                    { peca_codigo: 'AM-009', tipo: 'saida', quantidade: 4, motivo: 'Ordem de serviço nº 4983', user: opUser },
                    { peca_codigo: 'DF-002', tipo: 'saida', quantidade: 2, motivo: 'Venda direta ao cliente no balcão', user: opUser },
                    { peca_codigo: 'AL-006', tipo: 'entrada', quantidade: 5, motivo: 'Entrada de devolução de garantia de cliente', user: adminUser },
                    { peca_codigo: 'VI-008', tipo: 'saida', quantidade: 16, motivo: 'Venda atacado para Auto Elétrica Silva', user: opUser },
                    { peca_codigo: 'CD-004', tipo: 'entrada', quantidade: 15, motivo: 'Compra local para reposição urgente', user: opUser },
                    { peca_codigo: 'KE-011', tipo: 'saida', quantidade: 1, motivo: 'Ordem de serviço nº 4991', user: opUser },
                    { peca_codigo: 'PV-010', tipo: 'saida', quantidade: 4, motivo: 'Instalação na oficina interna', user: opUser },
                    { peca_codigo: 'RD-014', tipo: 'entrada', quantidade: 3, motivo: 'Importação direta Lote B', user: adminUser },
                    { peca_codigo: 'SA-015', tipo: 'saida', quantidade: 2, motivo: 'Venda Balcão', user: opUser },
                    { peca_codigo: 'JH-012', tipo: 'entrada', quantidade: 10, motivo: 'Ajuste de inventário anual', user: adminUser },
                    { peca_codigo: 'PF-001', tipo: 'saida', quantidade: 2, motivo: 'Venda direta', user: opUser },
                    { peca_codigo: 'FA-013', tipo: 'saida', quantidade: 5, motivo: 'Ordem de serviço nº 4995', user: opUser }
                ];

                for (const mov of movementsToCreate) {
                    const part = parts.find(p => p.codigo === mov.peca_codigo);
                    if (!part) continue;
                    const apiCall = mov.tipo === 'entrada' ? api.recordEntry : api.recordExit;
                    try {
                        await apiCall({
                            peca_id: part._id,
                            quantidade: mov.quantidade,
                            motivo: mov.motivo,
                            usuario_id: mov.user._id
                        });
                    } catch (err) { console.error('Error seeding movement:', mov, err); }
                }

                console.log("AutoPart-SyncDistributed: Seeding complete! Refreshing display.");
                this.go(this.state.page);
            }
        } catch (err) {
            console.error('Auto seeding failed:', err);
        }
    },

    go(page) {
        this.state.page = page;
        const pages = { 
            login: () => this.pageLogin(), 
            dashboard: () => this.pageDashboard(), 
            parts: () => this.pageParts(), 
            movements: () => this.pageMovements(), 
            reports: () => this.pageReports(),
            users: () => this.pageUsers()
        };
        (pages[page] || pages.login)();
    },

    sidebar(active) {
        const items = [
            { id:'dashboard', icon:'fa-chart-line', label:'Dashboard' },
            { id:'parts', icon:'fa-cogs', label:'Catálogo' },
            { id:'movements', icon:'fa-exchange-alt', label:'Movimentações' },
            { id:'reports', icon:'fa-chart-bar', label:'Relatórios' },
        ];
        if (this.state.user?.perfil === 'admin') {
            items.push({ id:'users', icon:'fa-users', label:'Usuários' });
        }
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
            <div class="p-3 border-t border-slate-800 space-y-2">
                <div class="px-4 py-2 mb-2"><span class="text-xs text-slate-500">${this.state.user?.nome || ''}</span><br><span class="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">${this.state.user?.perfil || ''}</span></div>
                <a href="help.html" target="_blank" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"><i class="fas fa-question-circle w-5"></i> Ajuda & Sistema</a>
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
                <div class="mt-6 pt-6 border-t border-slate-100 text-center">
                    <a href="help.html" target="_blank" class="text-sm text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2 transition-all">
                        <i class="fas fa-question-circle"></i> Entenda como o sistema funciona
                    </a>
                </div>
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

    showAddPartModal() {
        const modal = document.createElement('div');
        modal.id = 'add-part-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 class="text-xl font-bold text-slate-900">Nova Peça</h2>
                    <button onclick="App.closeAddPartModal()" class="text-slate-400 hover:text-slate-600 transition-colors"><i class="fas fa-times text-xl"></i></button>
                </div>
                <form id="add-part-form" class="p-6 space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-slate-700 mb-1">Nome da Peça</label>
                            <input type="text" name="nome" required class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Pastilha de Freio Dianteira">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Código</label>
                            <input type="text" name="codigo" required class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: PF-001">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                            <input type="text" name="descricao" class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Pastilha cerâmica">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Preço de Custo (R$)</label>
                            <input type="number" step="0.01" name="preco_custo" required class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Preço de Venda (R$)</label>
                            <input type="number" step="0.01" name="preco_venda" required class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Estoque Inicial</label>
                            <input type="number" name="estoque_atual" required class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
                            <input type="number" name="estoque_minimo" required class="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="5">
                        </div>
                    </div>
                    <div class="pt-4 flex gap-3">
                        <button type="button" onclick="App.closeAddPartModal()" class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 transition-all">Cancelar</button>
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all">Salvar Peça</button>
                    </div>
                </form>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('add-part-form').onsubmit = (e) => this.savePart(e);
    },

    closeAddPartModal() {
        document.getElementById('add-part-modal')?.remove();
    },

    async savePart(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Convert numbers
        data.preco_custo = parseFloat(data.preco_custo);
        data.preco_venda = parseFloat(data.preco_venda);
        data.estoque_atual = parseInt(data.estoque_atual);
        data.estoque_minimo = parseInt(data.estoque_minimo);

        try {
            await api.createPart(data);
            this.closeAddPartModal();
            this.pageParts(); // Refresh list
        } catch (err) {
            alert(err.mensagem || 'Erro ao salvar peça');
        }
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
    
    // ============ USERS ============
    async pageUsers() {
        document.getElementById('app').innerHTML = `
        <div class="flex min-h-screen">
            ${this.sidebar('users')}
            <main class="flex-1 p-8 overflow-auto">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-3xl font-bold">Gestão de Usuários</h1>
                    <button onclick="App.showAddUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
                        <i class="fas fa-user-plus"></i> Novo Usuário
                    </button>
                </div>
                <div id="users-content" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <p class="p-8 text-center text-slate-400">Carregando usuários...</p>
                </div>
            </main>
        </div>
        <!-- Modal Add User -->
        <div id="modal-user" class="fixed inset-0 z-[100] hidden flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold">Cadastrar Novo Usuário</h3>
                    <button onclick="App.closeUserModal()" class="text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button>
                </div>
                <form id="user-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input type="text" id="user-nome" required class="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                        <input type="email" id="user-email" required class="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Senha Provisória</label>
                        <input type="password" id="user-password" required class="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-slate-700 mb-1">Perfil de Acesso</label>
                        <select id="user-perfil" required class="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="consulta">Consulta (Apenas leitura)</option>
                            <option value="operador">Operador (Estoque)</option>
                            <option value="admin">Administrador (Total)</option>
                        </select>
                    </div>
                    <div class="pt-4 flex gap-3">
                        <button type="button" onclick="App.closeUserModal()" class="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">Cancelar</button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>`;
        
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                nome: document.getElementById('user-nome').value,
                email: document.getElementById('user-email').value,
                password: document.getElementById('user-password').value,
                perfil: document.getElementById('user-perfil').value
            };
            try {
                await api.createUser(data);
                this.closeUserModal();
                this.pageUsers();
            } catch(err) { 
                console.error('Create User Error:', err);
                alert(err.mensagem || `Erro ${err.codigo || ''}: Falha ao criar usuário. Verifique se o e-mail já existe.`); 
            }
        };

        try {
            const users = await api.getUsers();
            const rows = users.map(u => `
                <tr class="border-b border-slate-100 hover:bg-slate-50 transition-all">
                    <td class="px-6 py-4">
                        <div class="font-bold text-slate-900">${u.nome}</div>
                        <div class="text-xs text-slate-400">${u.email}</div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.perfil==='admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}">
                            ${u.perfil}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center gap-1.5 ${u.ativo ? 'text-emerald-600' : 'text-red-600'}">
                            <span class="w-1.5 h-1.5 rounded-full ${u.ativo ? 'bg-emerald-600' : 'bg-red-600'}"></span>
                            ${u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="App.toggleUser('${u._id}')" class="text-sm font-medium ${u.ativo ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700'}">
                            ${u.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                    </td>
                </tr>
            `).join('');

            document.getElementById('users-content').innerHTML = `
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                            <th class="px-6 py-3">Usuário</th>
                            <th class="px-6 py-3">Perfil</th>
                            <th class="px-6 py-3">Status</th>
                            <th class="px-6 py-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4" class="p-8 text-center text-slate-400">Nenhum usuário cadastrado</td></tr>'}</tbody>
                </table>`;
        } catch(e) { 
            document.getElementById('users-content').innerHTML = `<p class="p-8 text-red-500 text-center">${e.mensagem || 'Erro ao carregar usuários'}</p>`; 
        }
    },

    showAddUserModal() { document.getElementById('modal-user').classList.remove('hidden'); },
    closeUserModal() { document.getElementById('modal-user').classList.add('hidden'); },
    async toggleUser(id) {
        if (!confirm('Alterar status deste usuário?')) return;
        try {
            await api.toggleUserStatus(id);
            this.pageUsers();
        } catch(e) { alert(e.mensagem); }
    },

    logout() { localStorage.removeItem('token'); this.state.user = null; this.go('login'); }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
