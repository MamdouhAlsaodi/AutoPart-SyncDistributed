const App = {
    state: { user: null, page: 'login' },

    async init() {
        const token = localStorage.getItem('token');
        if (token) { try { this.state.user = await api.me(); this.go(this.state.user?.perfil === 'admin' ? 'admin-management' : 'storefront'); } catch { localStorage.removeItem('token'); this.go('storefront'); } }
        else this.go('storefront');
        document.getElementById('loading-screen')?.remove();
    },

    async pageStorefront() {
        document.getElementById('app').innerHTML = `<header class="store-header"><strong>AutoPart</strong><nav><a href="#catalogo">Catálogo</a><button id="cart-entry">Carrinho (<span id="cart-count">0</span>)</button><span id="cart-status" role="status" aria-live="polite"></span><button id="account-entry">Minha conta</button><button id="admin-entry">Área administrativa</button></nav></header><main class="storefront"><section class="hero"><h1>Peças certas para seu veículo</h1><p>Consulte nosso catálogo de autopeças com dados reais e disponibilidade atual.</p></section><section class="featured-section" aria-labelledby="featured-title"><h2 id="featured-title">Destaques</h2><p id="featured-state" role="status">Carregando destaques...</p><div id="featured-grid" class="featured-grid"></div></section><section id="catalogo" class="catalogue-section"><form id="catalogue-filters"><label>Buscar <input name="busca" autocomplete="off"></label><label>Marca <input name="marca"></label><label>Modelo <input name="modelo"></label><label>Categoria <input name="categoria"></label><button>Filtrar</button></form><p id="catalogue-state" role="status">Carregando catálogo...</p><div id="catalogue-grid" class="product-grid"></div></section></main><footer>AutoPart — catálogo público</footer><div id="product-modal" class="modal hidden" role="dialog" aria-modal="true"><div class="modal-card"><button id="close-modal" aria-label="Fechar">×</button><div id="product-detail"></div></div></div>`;
        if (this.state.user?.perfil === 'cliente') { const account = document.getElementById('account-entry'); account.textContent = this.escape(this.state.user.nome || 'Minha conta'); account.onclick = () => this.go('account'); const logout = document.createElement('button'); logout.id = 'logout-entry'; logout.textContent = 'Sair'; logout.onclick = () => this.logout(); account.after(logout); const orders = document.createElement('button'); orders.id = 'orders-entry'; orders.textContent = 'Meus pedidos'; orders.onclick = () => this.go('orders'); account.after(orders); } else { document.getElementById('account-entry').textContent = 'Entrar / cadastrar'; document.getElementById('account-entry').onclick = () => this.go('account'); } document.getElementById('cart-entry').onclick = () => this.go('cart'); document.getElementById('admin-entry').onclick = () => this.go('login'); this.updateCartCount();
        document.getElementById('catalogue-filters').onsubmit = e => { e.preventDefault(); this.loadCatalogue(new FormData(e.target)); };
        document.getElementById('close-modal').onclick = () => document.getElementById('product-modal').classList.add('hidden');
        document.addEventListener('keydown', e => { if (e.key === 'Escape') document.getElementById('product-modal')?.classList.add('hidden'); }, { once: true });
        await this.loadCatalogue();
    },
    escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    async loadCatalogue(form) { const state = document.getElementById('catalogue-state'), grid = document.getElementById('catalogue-grid'), featuredState = document.getElementById('featured-state'), featuredGrid = document.getElementById('featured-grid'); if (!state || !grid) return; state.textContent = 'Carregando catálogo...'; if (featuredState) featuredState.textContent = 'Carregando destaques...'; if (featuredGrid) featuredGrid.innerHTML = ''; try { const params = form ? Object.fromEntries([...form].filter(([,v]) => v.trim())) : {}; const result = await api.getCatalogue(params); const items = result.data || []; state.textContent = items.length ? `${result.count} produtos encontrados` : 'Nenhum produto encontrado.'; grid.innerHTML = items.map(p => `<article class="product-card"><h2>${this.escape(p.nome)}</h2><p>${this.escape(p.descricao)}</p><small>${this.escape(p.categoria || 'Sem categoria')} · ${this.escape(p.codigo)}</small><strong>R$ ${Number(p.preco_venda).toFixed(2)}</strong><button data-id="${this.escape(p.id || p._id)}">Ver detalhes</button><button class="add-cart" data-product='${this.escape(JSON.stringify({id:p.id || p._id,nome:p.nome,preco_venda:p.preco_venda}))}'>Adicionar ao carrinho</button></article>`).join(''); if (featuredState && featuredGrid) { featuredState.textContent = items.length ? 'Produtos selecionados do catálogo atual.' : 'Nenhum destaque disponível.'; featuredGrid.innerHTML = items.slice(0, 3).map(p => `<article class="featured-card"><h3>${this.escape(p.nome)}</h3><p>${this.escape(p.descricao)}</p><small>${this.escape(p.categoria || 'Sem categoria')}</small></article>`).join(''); } grid.querySelectorAll('[data-id]').forEach(b => b.onclick = () => this.showProduct(b.dataset.id)); grid.querySelectorAll('.add-cart').forEach(b => b.onclick = () => { Cart.addProduct(JSON.parse(b.dataset.product)); this.updateCartCount(); const status = document.getElementById('cart-status'); if (status) status.textContent = 'Produto adicionado ao carrinho.'; }); } catch (e) { state.textContent = e.mensagem || 'Não foi possível carregar o catálogo.'; grid.innerHTML = ''; if (featuredState) featuredState.textContent = 'Não foi possível carregar os destaques.'; if (featuredGrid) featuredGrid.innerHTML = ''; } },
    async showProduct(id) { try { const result = await api.getCatalogueDetail(id), p = result.data || result; const compatibilidades = Array.isArray(p.compatibilidades) ? p.compatibilidades : []; const compatibilityHtml = compatibilidades.length ? compatibilidades.map(c => `<li>${this.escape(c.marca)} ${this.escape(c.modelo)} — ${this.escape(Array.isArray(c.anos) ? c.anos.join(', ') : c.anos)}</li>`).join('') : '<li>Nenhuma compatibilidade informada.</li>'; document.getElementById('product-detail').innerHTML = `<h2>${this.escape(p.nome)}</h2><p>${this.escape(p.descricao)}</p><p>Categoria: ${this.escape(p.categoria || 'Sem categoria')}</p><p>Estoque: ${this.escape(p.estoque_atual)}</p><p>R$ ${Number(p.preco_venda).toFixed(2)}</p><h3>Compatibilidade</h3><ul>${compatibilityHtml}</ul>`; document.getElementById('product-detail').insertAdjacentHTML('beforeend', `<button id="detail-add">Adicionar ao carrinho</button>`); document.getElementById('detail-add').onclick = () => { Cart.addProduct({id:p.id || p._id,nome:p.nome,preco_venda:p.preco_venda}); this.updateCartCount(); const status = document.getElementById('cart-status'); if (status) status.textContent = 'Produto adicionado ao carrinho.'; }; document.getElementById('product-modal').classList.remove('hidden'); } catch (e) { alert(e.mensagem || 'Produto indisponível'); } },

    go(page) {
        this.state.page = page;
        const pages = { 
            storefront: () => this.pageStorefront(),
            'admin-management': () => this.pageAdminManagement(),
            login: () => this.pageLogin(), account: () => this.pageAccount(), cart: () => this.pageCart(), orders: () => this.pageOrders(),
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
                <button onclick="App.logout()" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all"><i class="fas fa-sign-out-alt w-5"></i> Sair</button>
            </div>
        </aside>`;
    },

    updateCartCount() { const el = document.getElementById('cart-count'); if (el) el.textContent = Cart.count(); },
    async pageAdminManagement() {
        if (this.state.user?.perfil !== 'admin') { this.go('storefront'); return; }
        const app = document.getElementById('app');
        app.innerHTML = `<main class="admin-management"><h1>Gestão administrativa</h1><p id="admin-feedback" role="status"></p><section><h2>Produtos</h2><form id="admin-product-form"><input name="codigo" required placeholder="Código"><input name="nome" required placeholder="Nome"><input name="descricao" placeholder="Descrição"><input name="preco_venda" type="number" step="0.01" required placeholder="Preço"><input name="estoque_atual" type="number" required placeholder="Estoque"><input name="estoque_minimo" type="number" placeholder="Estoque mínimo"><button>Salvar produto</button></form><div id="admin-products"></div></section><section><h2>Pedidos</h2><div id="admin-orders"></div></section></main>`;
        const feedback = document.getElementById('admin-feedback');
        const showError = error => { feedback.textContent = error.mensagem || 'Falha na operação'; };
        const fields = ['codigo', 'nome', 'descricao', 'preco_venda', 'estoque_atual', 'estoque_minimo'];
        const render = async () => { try { const [products, orders] = await Promise.all([api.admin.listProducts(), api.admin.listOrders()]);
            document.getElementById('admin-products').innerHTML = (products.data || []).map(p => `<article><span>${this.escape(p.nome)} — R$ ${Number(p.preco_venda).toFixed(2)} · estoque ${p.estoque_atual}</span> <button data-detail-product="${p._id}">Detalhes</button> <button data-edit-product="${p._id}">Editar</button> <button data-delete-product="${p._id}">Desativar</button></article>`).join('');
            document.getElementById('admin-orders').innerHTML = orders.map(o => `<article>Pedido ${this.escape(o.id)} — ${this.escape(o.status)} <button data-detail-order="${o.id}">Detalhes</button> <select data-status="${o.id}"><option value="">Alterar status</option><option>confirmado</option><option>em_processamento</option><option>enviado</option><option>concluido</option><option>cancelado</option></select></article>`).join('');
            document.querySelectorAll('[data-detail-product]').forEach(b => b.onclick = async () => { try { const r = await api.admin.getProduct(b.dataset.detailProduct); feedback.textContent = JSON.stringify(r.data || r); } catch (e) { showError(e); } });
            document.querySelectorAll('[data-edit-product]').forEach(b => b.onclick = async () => { try { const r = await api.admin.getProduct(b.dataset.editProduct), product = r.data || r; const payload = Object.fromEntries(fields.filter(f => product[f] !== undefined).map(f => [f, product[f]])); payload.nome = window.prompt('Nome', payload.nome) || payload.nome; await api.admin.updateProduct(b.dataset.editProduct, payload); await render(); } catch (e) { showError(e); } });
            document.querySelectorAll('[data-delete-product]').forEach(b => b.onclick = async () => { try { await api.admin.deleteProduct(b.dataset.deleteProduct); await render(); } catch (e) { showError(e); } });
            document.querySelectorAll('[data-detail-order]').forEach(b => b.onclick = async () => { try { const r = await api.admin.getOrder(b.dataset.detailOrder); feedback.textContent = JSON.stringify(r); } catch (e) { showError(e); } });
            document.querySelectorAll('[data-status]').forEach(select => select.onchange = async () => { if (select.value) try { await api.admin.updateOrderStatus(select.dataset.status, select.value); await render(); } catch (e) { showError(e); } });
        } catch (e) { showError(e); } };
        document.getElementById('admin-product-form').onsubmit = async e => { e.preventDefault(); try { const payload = Object.fromEntries(new FormData(e.target)); payload.preco_venda = Number(payload.preco_venda); payload.estoque_atual = Number(payload.estoque_atual); if (payload.estoque_minimo) payload.estoque_minimo = Number(payload.estoque_minimo); await api.admin.createProduct(payload); e.target.reset(); await render(); } catch (error) { showError(error); } };
        await render();
    },
    pageAccount() { this.pageLogin(true); },
    pageLogin(account = false) {
        document.getElementById('app').innerHTML = `<main class="auth-surface"><h1>AutoPart</h1><form id="login-form"><h2>Entrar</h2><input id="email" type="email" required placeholder="E-mail"><input id="password" type="password" required placeholder="Senha"><button>Entrar</button><p id="auth-error" role="alert"></p></form><form id="register-form"><h2>Criar conta</h2><input id="register-nome" required placeholder="Nome"><input id="register-email" type="email" required placeholder="E-mail"><input id="register-password" type="password" required minlength="6" placeholder="Senha (mínimo 6)"><input id="register-confirm" type="password" required minlength="6" placeholder="Confirme a senha"><button>Cadastrar</button></form><button id="back-store">Voltar ao catálogo</button></main>`;
        document.getElementById('back-store').onclick = () => this.go('storefront');
        document.getElementById('login-form').onsubmit = async e => { e.preventDefault(); try { const res = await api.login({email:email.value,password:password.value}); localStorage.setItem('token',res.token); this.state.user=res.user; this.go(res.user?.perfil === 'admin' ? 'admin-management' : res.user?.perfil === 'cliente' ? 'storefront' : 'dashboard'); } catch(err) { document.getElementById('auth-error').textContent = err.mensagem || 'Falha na autenticação'; } };
        document.getElementById('register-form').onsubmit = async e => { e.preventDefault(); const n=document.getElementById('register-nome').value.trim(), em=document.getElementById('register-email').value.trim(), pw=document.getElementById('register-password').value, cf=document.getElementById('register-confirm').value; if(!n || !em || pw.length<6 || pw!==cf) return document.getElementById('auth-error').textContent='Valide nome, e-mail, senha (mínimo 6) e confirmação.'; try { await api.register({nome:n,email:em,password:pw}); e.target.reset(); document.getElementById('auth-error').textContent='Cadastro realizado. Faça login.'; } catch(err) { document.getElementById('auth-error').textContent=err.mensagem || 'Falha no cadastro'; } };
    },
    pageCart() {
        const items=Cart.items(), app=document.getElementById('app');
        if (!this.state.user || this.state.user.perfil !== 'cliente') { app.innerHTML='<main class="cart-page"><h1>Carrinho</h1><p>É necessário entrar como cliente para finalizar a compra.</p></main>'; return; }
        app.innerHTML=`<main class="cart-page"><button id="cart-back">Voltar</button><h1>Revisar carrinho</h1>${items.map(i=>`<article><h2>${this.escape(i.nome)}</h2><p>Estimativa: R$ ${(Cart.lineSubtotal(i)/100).toFixed(2)}</p><span>${i.quantity}</span></article>`).join('')||'<p>Carrinho vazio.</p>'}<p>Total estimado: R$ ${(Cart.total()/100).toFixed(2)}</p>${items.length?'<button id="checkout-action">Finalizar pedido</button>':''}<p id="checkout-feedback" role="status"></p></main>`;
        document.getElementById('cart-back').onclick=()=>this.go('storefront'); const button=document.getElementById('checkout-action'); if(button) button.onclick=async()=>{button.disabled=true;button.textContent='Finalizando...';try{const order=await api.checkout(Cart.items());Cart.clear();this.updateCartCount();document.getElementById('checkout-feedback').textContent=`Pedido confirmado. Total do servidor: R$ ${Number(order.total).toFixed(2)}`;}catch(e){button.disabled=false;button.textContent='Finalizar pedido';document.getElementById('checkout-feedback').textContent=this.escape(e.mensagem||'Falha ao finalizar pedido');}};
    },
    async pageOrders() { const app=document.getElementById('app'); app.innerHTML='<main class="orders-page"><h1>Meus pedidos</h1><p role="status">Carregando pedidos...</p><div id="orders-list"></div></main>'; try { const orders=await api.getMyOrders(); const list=document.getElementById('orders-list'); list.innerHTML=orders.length?orders.map(o=>`<article><strong>Pedido ${this.escape(o.id)}</strong><p>Status: ${this.escape(o.status)} · Total: R$ ${Number(o.total).toFixed(2)} · ${this.escape(o.criado_em)}</p><button data-order="${this.escape(o.id)}">Detalhes</button></article>`).join(''):'<p>Nenhum pedido.</p>'; list.querySelectorAll('[data-order]').forEach(b=>b.onclick=async()=>{const o=await api.getMyOrder(b.dataset.order); document.getElementById('orders-list').insertAdjacentHTML('beforeend',`<pre>${this.escape(JSON.stringify(o.items,null,2))}</pre>`);}); } catch(e) { app.querySelector('[role=status]').textContent='Não foi possível carregar os pedidos.'; } },

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

    logout() { localStorage.removeItem('token'); this.state.user = null; this.go('storefront'); }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
