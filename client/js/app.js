const App = {
    state: { user: null, page: 'login' },

    async init() {
        const token = localStorage.getItem('token');
        if (token) { try { this.state.user = await api.me(); this.go(this.state.user?.perfil === 'admin' ? 'admin-management' : 'storefront'); } catch { localStorage.removeItem('token'); this.go('storefront'); } }
        else this.go('storefront');
        document.getElementById('loading-screen')?.remove();
    },

    async pageStorefront() {
        document.getElementById('app').innerHTML = `<header class="store-header"><a class="site-brand" href="/" aria-label="AutoPart — página inicial"><img src="/favicon.svg" alt="" width="42" height="42"><span><strong>AutoPart</strong><small>Peças &amp; gestão</small></span></a><nav><a href="#catalogo">Catálogo</a><button id="cart-entry">Carrinho (<span id="cart-count">0</span>)</button><span id="cart-status" role="status" aria-live="polite"></span><button id="account-entry">Minha conta</button><button id="admin-entry">Área administrativa</button></nav></header><main class="storefront"><section class="hero"><span class="hero-kicker">AutoPart · catálogo acadêmico</span><h1>Peças certas para cada veículo</h1><p>Explore o catálogo acadêmico com peças e compatibilidades fictícias para demonstração.</p><a class="hero-cta" href="#catalogo">Explorar catálogo <span aria-hidden="true">→</span></a></section><section class="featured-section" aria-labelledby="featured-title"><h2 id="featured-title">Seleção do catálogo</h2><p id="featured-state" role="status">Carregando destaques...</p><div id="featured-grid" class="featured-grid"></div></section><section id="catalogo" class="catalogue-section"><form id="catalogue-filters"><label>Buscar <input name="busca" autocomplete="off"></label><label>Marca <input name="marca"></label><label>Modelo <input name="modelo"></label><label>Categoria <input name="categoria"></label><button>Filtrar</button></form><p id="catalogue-state" role="status">Carregando catálogo...</p><div id="catalogue-grid" class="product-grid"></div></section></main><footer>AutoPart — catálogo público</footer><div id="product-modal" class="modal hidden" role="dialog" aria-modal="true"><div class="modal-card"><button id="close-modal" aria-label="Fechar">×</button><div id="product-detail"></div></div></div>`;
        if (this.state.user?.perfil === 'cliente') { const account = document.getElementById('account-entry'); account.textContent = this.escape(this.state.user.nome || 'Minha conta'); account.onclick = () => this.go('account'); const logout = document.createElement('button'); logout.id = 'logout-entry'; logout.textContent = 'Sair'; logout.onclick = () => this.logout(); account.after(logout); const orders = document.createElement('button'); orders.id = 'orders-entry'; orders.textContent = 'Meus pedidos'; orders.onclick = () => this.go('orders'); account.after(orders); } else { document.getElementById('account-entry').textContent = 'Entrar / cadastrar'; document.getElementById('account-entry').onclick = () => this.go('account'); } document.getElementById('cart-entry').onclick = () => this.go('cart'); document.getElementById('admin-entry').onclick = () => this.go('login'); this.updateCartCount();
        document.getElementById('catalogue-filters').onsubmit = e => { e.preventDefault(); this.loadCatalogue(new FormData(e.target)); };
        document.getElementById('close-modal').onclick = () => document.getElementById('product-modal').classList.add('hidden');
        document.addEventListener('keydown', e => { if (e.key === 'Escape') document.getElementById('product-modal')?.classList.add('hidden'); }, { once: true });
        await this.loadCatalogue();
    },
    escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); },
    summarizeOperations(parts, history) {
        const active = (parts || []).filter(p => p.ativo !== false);
        const movements = Array.isArray(history) ? history : [];
        const count = tipo => movements.filter(m => m.tipo === tipo);
        const entries = count('entrada'), exits = count('saida');
        return {
            totalProducts: active.length,
            stockUnits: active.reduce((n, p) => n + Number(p.estoque_atual || 0), 0),
            lowStock: active.filter(p => Number(p.estoque_atual) <= Number(p.estoque_minimo)).length,
            outOfStock: active.filter(p => Number(p.estoque_atual) === 0).length,
            highStock: active.filter(p => Number(p.estoque_atual) > 1000).length,
            stockValue: Math.round(active.reduce((n, p) => n + Number(p.estoque_atual || 0) * Number(p.preco_venda || 0), 0) * 100) / 100,
            entries: entries.length, exits: exits.length,
            unitsIn: entries.reduce((n, m) => n + Number(m.quantidade || 0), 0),
            unitsOut: exits.reduce((n, m) => n + Number(m.quantidade || 0), 0)
        };
    },
    async loadCatalogue(form) { const state = document.getElementById('catalogue-state'), grid = document.getElementById('catalogue-grid'), featuredState = document.getElementById('featured-state'), featuredGrid = document.getElementById('featured-grid'); if (!state || !grid) return; state.textContent = 'Carregando catálogo...'; if (featuredState) featuredState.textContent = 'Carregando destaques...'; if (featuredGrid) featuredGrid.innerHTML = ''; try { const params = form ? Object.fromEntries([...form].filter(([,v]) => v.trim())) : {}; const result = await api.getCatalogue(params); const items = result.data || []; state.textContent = items.length ? `${result.count} produtos encontrados` : 'Nenhum produto encontrado.'; grid.innerHTML = items.map(p => `<article class="product-card"><h2>${this.escape(p.nome)}</h2><p>${this.escape(p.descricao)}</p><small class="part-label"><b>SKU ${this.escape(p.codigo)}</b><span>${this.escape(p.categoria || 'Sem categoria')}</span><span>ESTOQUE ${this.escape(p.estoque_atual ?? '—')}</span></small><strong>R$ ${Number(p.preco_venda).toFixed(2)}</strong><button data-id="${this.escape(p.id || p._id)}">Consultar detalhes</button><button class="add-cart" data-product='${this.escape(JSON.stringify({id:p.id || p._id,nome:p.nome,preco_venda:p.preco_venda}))}'>Adicionar</button></article>`).join(''); if (featuredState && featuredGrid) { featuredState.textContent = items.length ? 'Produtos selecionados do catálogo atual.' : 'Nenhum destaque disponível.'; featuredGrid.innerHTML = items.slice(0, 3).map(p => `<article class="featured-card"><h3>${this.escape(p.nome)}</h3><p>${this.escape(p.descricao)}</p><small class="part-label"><b>${this.escape(p.codigo || 'SKU —')}</b><span>${this.escape(p.categoria || 'Sem categoria')}</span><span>ESTOQUE ${this.escape(p.estoque_atual ?? '—')}</span></small></article>`).join(''); } grid.querySelectorAll('[data-id]').forEach(b => b.onclick = () => this.showProduct(b.dataset.id)); grid.querySelectorAll('.add-cart').forEach(b => b.onclick = () => { Cart.addProduct(JSON.parse(b.dataset.product)); this.updateCartCount(); const status = document.getElementById('cart-status'); if (status) status.textContent = 'Produto adicionado ao carrinho.'; }); } catch (e) { state.textContent = e.mensagem || 'Não foi possível carregar o catálogo.'; grid.innerHTML = ''; if (featuredState) featuredState.textContent = 'Não foi possível carregar os destaques.'; if (featuredGrid) featuredGrid.innerHTML = ''; } },
    async showProduct(id) { try { const result = await api.getCatalogueDetail(id), p = result.data || result; const compatibilidades = Array.isArray(p.compatibilidades) ? p.compatibilidades : []; const compatibilityHtml = compatibilidades.length ? compatibilidades.map(c => `<li>${this.escape(c.marca)} ${this.escape(c.modelo)} — ${this.escape(Array.isArray(c.anos) ? c.anos.join(', ') : c.anos)}</li>`).join('') : '<li>Nenhuma compatibilidade informada.</li>'; document.getElementById('product-detail').innerHTML = `<h2>${this.escape(p.nome)}</h2><p>${this.escape(p.descricao)}</p><p>Categoria: ${this.escape(p.categoria || 'Sem categoria')}</p><p>Estoque: ${this.escape(p.estoque_atual)}</p><p>R$ ${Number(p.preco_venda).toFixed(2)}</p><h3>Compatibilidade</h3><ul>${compatibilityHtml}</ul>`; document.getElementById('product-detail').insertAdjacentHTML('beforeend', `<button id="detail-add">Adicionar</button>`); document.getElementById('detail-add').onclick = () => { Cart.addProduct({id:p.id || p._id,nome:p.nome,preco_venda:p.preco_venda}); this.updateCartCount(); const status = document.getElementById('cart-status'); if (status) status.textContent = 'Produto adicionado ao carrinho.'; }; document.getElementById('product-modal').classList.remove('hidden'); } catch (e) { this.showFeedback(e.mensagem || 'Produto indisponível'); } },

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

    managementShell(active, title, content, actions = '') {
        return `<div class="management-shell"><aside class="management-sidebar">${this.sidebar(active)}</aside><main class="management-workspace"><header class="management-header"><div><p class="eyebrow">AutoPart Gestão</p><h1 class="page-heading">${title}</h1></div><div class="header-actions">${actions}</div></header>${content}</main></div>`;
    },
    sidebar(active) {
        const items = [{id:'dashboard',label:'Visão geral'},{id:'parts',label:'Peças e catálogo'},{id:'movements',label:'Movimentações'},{id:'reports',label:'Relatórios'}];
        if (this.state.user?.perfil === 'admin') { items.unshift({id:'admin-management',label:'Central de operações'}); items.push({id:'users',label:'Usuários e acessos'}); }
        return `<div class="sidebar-inner"><div class="brand-lockup"><img class="brand-mark" src="/favicon.svg" alt="" width="42" height="42"><div><strong>AutoPart</strong><small>Peças &amp; gestão</small></div></div><nav class="management-nav" aria-label="Navegação principal">${items.map(i=>`<button type="button" class="nav-item ${active===i.id?'is-active':''}" ${active===i.id?'aria-current="page"':''} onclick="App.go('${i.id}')">${i.label}</button>`).join('')}</nav><div class="sidebar-footer"><span class="user-name">${this.escape(this.state.user?.nome||'Usuário')}</span><span class="status-chip status-chip--neutral">${this.escape(this.state.user?.perfil||'')}</span><button class="nav-item nav-item--exit" onclick="App.logout()">Sair</button></div></div>`;
    },
    paginateAdminRows(rows, { query = '', page = 1, size = 12, includeInactive = false } = {}) {
        const term = String(query).trim().toLocaleLowerCase();
        const filtered = (rows || []).filter(row => (includeInactive || row.ativo !== false) &&
            (!term || [row.codigo, row.nome].some(value => String(value || '').toLocaleLowerCase().includes(term))));
        const pages = Math.max(1, Math.ceil(filtered.length / size));
        const current = Math.max(1, Math.min(pages, Number(page) || 1));
        return { items: filtered.slice((current - 1) * size, current * size), total: filtered.length, pages, page: current };
    },
    allowedOrderStatuses(current) {
        return { pendente: ['confirmado', 'cancelado'], confirmado: ['em_processamento', 'cancelado'],
            em_processamento: ['enviado', 'cancelado'], enviado: ['concluido'], concluido: [], cancelado: [] }[current] || [];
    },

    showFeedback(message) { const app=document.getElementById('app'); if (!app) return; let panel=document.getElementById('app-feedback'); if (!panel) { panel=document.createElement('div'); panel.id='app-feedback'; panel.className='feedback-panel'; panel.setAttribute('role','alert'); app.prepend(panel); } panel.textContent=message; panel.focus(); },

    updateCartCount() { const el = document.getElementById('cart-count'); if (el) el.textContent = Cart.count(); },
    async pageAdminManagement() {
        if (this.state.user?.perfil !== 'admin') { this.go('storefront'); return; }
        const app = document.getElementById('app');
        app.innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('admin-management')}</aside><main class="management-workspace admin-management"><header class="management-header admin-center-header"><div><p class="eyebrow">AutoPart Gestão · demonstração</p><h1 class="page-heading">Central de operações</h1><p>Produtos e pedidos num só lugar, com acesso rápido pelo menu lateral.</p></div><button type="button" id="admin-new-product" aria-expanded="false" aria-controls="product-form-panel">+ Novo produto</button></header><p id="admin-feedback" class="admin-alert" role="status" aria-live="polite"></p><div id="admin-summary" class="admin-summary" aria-label="Resumo operacional"></div><section id="product-form-panel" class="admin-panel admin-create-panel" hidden><div class="admin-section-heading"><div><p class="eyebrow">Catálogo</p><h2>Novo produto</h2></div><button type="button" id="admin-cancel-product" class="admin-quiet-button">Fechar</button></div><form id="admin-product-form" class="admin-form-grid"><label>Código<input name="codigo" required maxlength="60" placeholder="Ex.: DEMO-0610"></label><label>Nome<input name="nome" required maxlength="160" placeholder="Nome da peça"></label><label class="admin-wide">Descrição<input name="descricao" maxlength="400" placeholder="Descrição para o catálogo"></label><label>Preço (R$)<input name="preco_venda" type="number" min="0" step="0.01" required placeholder="0,00"></label><label>Estoque atual<input name="estoque_atual" type="number" min="0" step="1" required placeholder="0"></label><label>Estoque mínimo<input name="estoque_minimo" type="number" min="0" step="1" value="5" required></label><button type="submit">Salvar produto</button></form></section><section class="admin-panel" aria-labelledby="admin-products-heading"><div class="admin-section-heading"><div><p class="eyebrow">Catálogo e estoque</p><h2 id="admin-products-heading">Produtos</h2></div><span id="admin-products-count" class="admin-section-count"></span></div><div class="admin-toolbar"><label>Buscar por código ou nome<input id="admin-product-search" type="search" autocomplete="off" placeholder="Ex.: filtro ou DEMO-0003"></label><label class="admin-check"><input id="admin-show-inactive" type="checkbox"> Mostrar inativos</label></div><div class="admin-table-wrap"><table><thead><tr><th>Código / produto</th><th>Preço</th><th>Estoque</th><th>Situação</th><th>Ações</th></tr></thead><tbody id="admin-products"><tr><td colspan="5">Carregando produtos...</td></tr></tbody></table></div><div id="admin-product-pager" class="admin-pager"></div></section><section class="admin-panel" aria-labelledby="admin-orders-heading"><div class="admin-section-heading"><div><p class="eyebrow">Solicitações simuladas</p><h2 id="admin-orders-heading">Pedidos</h2></div><span id="admin-orders-count" class="admin-section-count"></span></div><div class="admin-table-wrap"><table><thead><tr><th>Pedido / cliente</th><th>Data</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody id="admin-orders"><tr><td colspan="5">Carregando pedidos...</td></tr></tbody></table></div><div id="admin-order-pager" class="admin-pager"></div></section><dialog id="admin-detail-dialog" class="admin-detail-dialog"><button type="button" id="admin-detail-close" aria-label="Fechar detalhes">×</button><div id="admin-detail-content"></div></dialog></main></div>`;
        const state = { products: [], orders: [], query: '', includeInactive: false, productPage: 1, orderPage: 1 };
        const feedback = document.getElementById('admin-feedback');
        const notify = (message, kind = 'info') => { feedback.textContent = message; feedback.dataset.kind = kind; };
        const showError = error => notify(error.mensagem || 'Falha na operação. Tente novamente.', 'error');
        const money = value => Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const details = html => { const dialog = document.getElementById('admin-detail-dialog'); document.getElementById('admin-detail-content').innerHTML = html; if (dialog.showModal) dialog.showModal(); else dialog.open = true; };
        document.getElementById('admin-detail-close').onclick = () => document.getElementById('admin-detail-dialog').close();
        const newProduct = document.getElementById('admin-new-product');
        const formPanel = document.getElementById('product-form-panel');
        const toggleForm = open => { formPanel.hidden = !open; newProduct.setAttribute('aria-expanded', String(open)); if (open) formPanel.querySelector('input[name="codigo"]').focus(); };
        newProduct.onclick = () => toggleForm(formPanel.hidden);
        document.getElementById('admin-cancel-product').onclick = () => toggleForm(false);
        const renderSummary = () => {
            const active = state.products.filter(p => p.ativo !== false);
            const pending = state.orders.filter(o => o.status === 'pendente').length;
            document.getElementById('admin-summary').innerHTML = [
                ['Produtos ativos', active.length],
                ['Estoque baixo', active.filter(p => Number(p.estoque_atual) <= Number(p.estoque_minimo)).length],
                ['Pedidos registrados', state.orders.length],
                ['Pedidos pendentes', pending]
            ].map(([label, value]) => `<article><span>${label}</span><strong>${value}</strong></article>`).join('');
        };
        const renderProducts = () => {
            const page = this.paginateAdminRows(state.products, { query: state.query, page: state.productPage, size: 12, includeInactive: state.includeInactive });
            state.productPage = page.page;
            document.getElementById('admin-products-count').textContent = `${page.total} encontrados`;
            const rows = page.items.map(p => {
                const id = this.escape(p._id);
                const status = p.ativo === false ? 'Inativo' : Number(p.estoque_atual) <= Number(p.estoque_minimo) ? 'Estoque baixo' : 'Disponível';
                const tone = p.ativo === false ? 'muted' : status === 'Estoque baixo' ? 'warning' : 'success';
                return `<tr><td><strong>${this.escape(p.codigo)}</strong><small>${this.escape(p.nome)}</small></td><td>R$ ${money(p.preco_venda)}</td><td>${this.escape(p.estoque_atual)}</td><td><span class="admin-badge admin-badge--${tone}">${status}</span></td><td><div class="admin-row-actions"><button type="button" data-detail-product="${id}" aria-label="Detalhes de ${this.escape(p.nome)}">Detalhes</button><button type="button" data-edit-product="${id}" aria-label="Editar ${this.escape(p.nome)}">Editar</button>${p.ativo === false ? '' : `<button type="button" class="admin-danger" data-delete-product="${id}" aria-label="Desativar ${this.escape(p.nome)}">Desativar</button>`}</div></td></tr>`;
            }).join('');
            const tbody = document.getElementById('admin-products');
            tbody.innerHTML = rows || '<tr><td colspan="5" class="admin-empty">Nenhum produto encontrado. Ajuste a busca ou os filtros.</td></tr>';
            const start = page.total ? (page.page - 1) * 12 + 1 : 0;
            const end = Math.min(page.page * 12, page.total);
            const pager = document.getElementById('admin-product-pager');
            pager.innerHTML = `<span>Mostrando ${start}–${end} de ${page.total}</span><div><button type="button" data-prev ${page.page === 1 ? 'disabled' : ''}>Anterior</button><span>Página ${page.page} de ${page.pages}</span><button type="button" data-next ${page.page === page.pages ? 'disabled' : ''}>Próxima</button></div>`;
            pager.querySelector('[data-prev]').onclick = () => { state.productPage--; renderProducts(); };
            pager.querySelector('[data-next]').onclick = () => { state.productPage++; renderProducts(); };
            tbody.querySelectorAll('[data-detail-product]').forEach(b => b.onclick = async () => { try { const r = await api.admin.getProduct(b.dataset.detailProduct), p = r.data || r; details(`<h2>${this.escape(p.nome)}</h2><p class="admin-detail-lead">${this.escape(p.codigo)}</p><dl><div><dt>Preço</dt><dd>R$ ${money(p.preco_venda)}</dd></div><div><dt>Estoque</dt><dd>${this.escape(p.estoque_atual)}</dd></div><div><dt>Mínimo</dt><dd>${this.escape(p.estoque_minimo)}</dd></div><div><dt>Situação</dt><dd>${p.ativo === false ? 'Inativo' : 'Ativo'}</dd></div></dl><p>${this.escape(p.descricao || 'Sem descrição.')}</p>`); } catch (error) { showError(error); } });
            tbody.querySelectorAll('[data-edit-product]').forEach(b => b.onclick = async () => { try { const r = await api.admin.getProduct(b.dataset.editProduct), p = r.data || r; const fields = ['codigo', 'nome', 'descricao', 'preco_venda', 'estoque_atual', 'estoque_minimo']; const payload = Object.fromEntries(fields.filter(f => p[f] !== undefined).map(f => [f, p[f]])); this.showEditProductModal(b.dataset.editProduct, payload, async () => { await refreshData(); notify('Produto atualizado.', 'success'); }); } catch (error) { showError(error); } });
            tbody.querySelectorAll('[data-delete-product]').forEach(b => b.onclick = async () => { if (!window.confirm('Desativar este produto? Ele deixará de aparecer no catálogo público.')) return; try { await api.admin.deleteProduct(b.dataset.deleteProduct); await refreshData(); notify('Produto desativado.', 'success'); } catch (error) { showError(error); } });
        };
        const renderOrders = () => {
            const page = this.paginateAdminRows(state.orders, { page: state.orderPage, size: 8, includeInactive: true });
            state.orderPage = page.page;
            document.getElementById('admin-orders-count').textContent = `${page.total} pedidos`;
            const rows = page.items.map(o => {
                const id = this.escape(o.id);
                const status = this.escape(o.status);
                const transitions = this.allowedOrderStatuses(o.status);
                const action = transitions.length ? `<select data-status="${id}" aria-label="Alterar status do pedido ${id}"><option value="">Alterar status</option>${transitions.map(s => `<option value="${s}">${this.escape(s.replaceAll('_', ' '))}</option>`).join('')}</select>` : '<span class="admin-muted">Sem ações</span>';
                const date = new Date(o.criado_em);
                return `<tr><td><strong>#${id.slice(-8)}</strong><small>${this.escape(o.customer?.nome || 'Cliente demo')}</small></td><td>${Number.isNaN(date.getTime()) ? '—' : this.escape(date.toLocaleDateString('pt-BR'))}</td><td>R$ ${money(o.total)}</td><td><span class="admin-badge admin-badge--${['concluido','cancelado'].includes(o.status) ? 'muted' : 'info'}">${status}</span></td><td><div class="admin-row-actions"><button type="button" data-detail-order="${id}" aria-label="Detalhes do pedido ${id}">Detalhes</button>${action}</div></td></tr>`;
            }).join('');
            const tbody = document.getElementById('admin-orders');
            tbody.innerHTML = rows || '<tr><td colspan="5" class="admin-empty">Nenhum pedido registrado ainda.</td></tr>';
            const start = page.total ? (page.page - 1) * 8 + 1 : 0;
            const end = Math.min(page.page * 8, page.total);
            const pager = document.getElementById('admin-order-pager');
            pager.innerHTML = `<span>Mostrando ${start}–${end} de ${page.total}</span><div><button type="button" data-prev ${page.page === 1 ? 'disabled' : ''}>Anterior</button><span>Página ${page.page} de ${page.pages}</span><button type="button" data-next ${page.page === page.pages ? 'disabled' : ''}>Próxima</button></div>`;
            pager.querySelector('[data-prev]').onclick = () => { state.orderPage--; renderOrders(); };
            pager.querySelector('[data-next]').onclick = () => { state.orderPage++; renderOrders(); };
            tbody.querySelectorAll('[data-detail-order]').forEach(b => b.onclick = async () => { try { const o = await api.admin.getOrder(b.dataset.detailOrder); details(`<h2>Pedido #${this.escape(o.id.slice(-8))}</h2><p class="admin-detail-lead">${this.escape(o.customer?.nome || 'Cliente demo')} · ${this.escape(o.status)}</p><ul>${o.items.map(i => `<li>${this.escape(i.partName)} × ${this.escape(i.quantity)} — R$ ${money(i.unitPrice)}</li>`).join('')}</ul><strong>Total: R$ ${money(o.total)}</strong>`); } catch (error) { showError(error); } });
            tbody.querySelectorAll('[data-status]').forEach(select => select.onchange = async () => { if (!select.value) return; select.disabled = true; try { await api.admin.updateOrderStatus(select.dataset.status, select.value); await refreshData(); notify('Status do pedido atualizado.', 'success'); } catch (error) { select.disabled = false; select.value = ''; showError(error); } });
        };
        const refreshData = async () => { try { const [products, orders] = await Promise.all([api.admin.listProducts(), api.admin.listOrders()]); state.products = products.data || []; state.orders = orders; renderSummary(); renderProducts(); renderOrders(); } catch (error) { showError(error); } };
        document.getElementById('admin-product-search').oninput = event => { state.query = event.target.value; state.productPage = 1; renderProducts(); };
        document.getElementById('admin-show-inactive').onchange = event => { state.includeInactive = event.target.checked; state.productPage = 1; renderProducts(); };
        document.getElementById('admin-product-form').onsubmit = async event => { event.preventDefault(); const button = event.target.querySelector('button[type="submit"]'); button.disabled = true; try { const payload = Object.fromEntries(new FormData(event.target)); for (const key of ['preco_venda', 'estoque_atual', 'estoque_minimo']) payload[key] = Number(payload[key]); await api.admin.createProduct(payload); event.target.reset(); toggleForm(false); state.query = payload.codigo; state.productPage = 1; document.getElementById('admin-product-search').value = payload.codigo; await refreshData(); notify('Produto cadastrado. O novo código está selecionado na busca.', 'success'); } catch (error) { showError(error); } finally { button.disabled = false; } };
        await refreshData();
    },
    showEditProductModal(id, payload, onSaved) {
        const modal = document.createElement('div');
        modal.className = 'modal admin-edit-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Editar produto');
        modal.innerHTML = `<div class="modal-card"><button type="button" class="modal-close" aria-label="Fechar">×</button><p class="eyebrow">Catálogo</p><h2>Editar produto</h2><p>Código: ${this.escape(payload.codigo || '')}</p><form class="inline-edit-form"><label>Nome<input name="nome" required value="${this.escape(payload.nome || '')}"></label><label>Descrição<input name="descricao" value="${this.escape(payload.descricao || '')}"></label><div class="admin-edit-numbers"><label>Preço (R$)<input name="preco_venda" type="number" min="0" step="0.01" required value="${this.escape(payload.preco_venda)}"></label><label>Estoque atual<input name="estoque_atual" type="number" min="0" step="1" required value="${this.escape(payload.estoque_atual)}"></label><label>Estoque mínimo<input name="estoque_minimo" type="number" min="0" step="1" required value="${this.escape(payload.estoque_minimo)}"></label></div><p class="admin-modal-error" role="alert"></p><div class="admin-edit-actions"><button type="button" class="modal-cancel">Cancelar</button><button type="submit">Salvar alterações</button></div></form></div>`;
        document.body.appendChild(modal);
        const onKeydown = event => { if (event.key === 'Escape') close(); };
        const close = () => { document.removeEventListener('keydown', onKeydown); modal.remove(); };
        document.addEventListener('keydown', onKeydown);
        modal.querySelector('.modal-close').onclick = close;
        modal.querySelector('.modal-cancel').onclick = close;
        modal.querySelector('input[name="nome"]').focus();
        modal.querySelector('form').onsubmit = async event => { event.preventDefault(); const button = event.target.querySelector('[type="submit"]'); button.disabled = true; try { const fields = Object.fromEntries(new FormData(event.target)); for (const key of ['preco_venda', 'estoque_atual', 'estoque_minimo']) fields[key] = Number(fields[key]); await api.admin.updateProduct(id, { ...payload, ...fields }); close(); await onSaved(); } catch (error) { modal.querySelector('.admin-modal-error').textContent = error.mensagem || 'Não foi possível atualizar a peça.'; button.disabled = false; } };
    },
    async pageDashboard() {
        const app=document.getElementById('app'); app.innerHTML=`<div class="management-shell"><aside class="management-sidebar">${this.sidebar('dashboard')}</aside><main class="management-workspace"><header class="management-header"><div><p class="eyebrow">AutoPart Gestão</p><h1 class="page-heading">Visão geral</h1></div></header><section class="dashboard-grid"><article class="management-card"><h2>Operação diária</h2><p>Consulte estoque, movimentações e relatórios pelo menu lateral.</p></article><article class="management-card"><h2>Acesso atual</h2><p>${this.escape(this.state.user?.nome||'Usuário')} · ${this.escape(this.state.user?.perfil||'')}</p></article></section></main></div>`;
    },
    pageAccount() { this.pageLogin(true); },
    pageLogin(account = false) {
        document.getElementById('app').innerHTML = `<main class="auth-surface"><h1 class="auth-brand"><img src="/favicon.svg" alt="" width="46" height="46"><span>AutoPart</span></h1><form id="login-form"><h2>Entrar</h2><input id="email" type="email" required placeholder="E-mail"><input id="password" type="password" required placeholder="Senha"><button>Entrar</button><p id="auth-error" role="alert"></p></form><form id="register-form"><h2>Criar conta</h2><input id="register-nome" required placeholder="Nome"><input id="register-email" type="email" required placeholder="E-mail"><input id="register-password" type="password" required minlength="6" placeholder="Senha (mínimo 6)"><input id="register-confirm" type="password" required minlength="6" placeholder="Confirme a senha"><button>Cadastrar</button></form><button id="back-store">Voltar ao catálogo</button></main>`;
        document.getElementById('back-store').onclick = () => this.go('storefront');
        document.getElementById('login-form').onsubmit = async e => { e.preventDefault(); try { const res = await api.login({email:email.value,password:password.value}); localStorage.setItem('token',res.token); this.state.user=res.user; this.go(res.user?.perfil === 'admin' ? 'admin-management' : res.user?.perfil === 'cliente' ? 'storefront' : 'dashboard'); } catch(err) { document.getElementById('auth-error').textContent = err.mensagem || 'Falha na autenticação'; } };
        document.getElementById('register-form').onsubmit = async e => { e.preventDefault(); const n=document.getElementById('register-nome').value.trim(), em=document.getElementById('register-email').value.trim(), pw=document.getElementById('register-password').value, cf=document.getElementById('register-confirm').value; if(!n || !em || pw.length<6 || pw!==cf) return document.getElementById('auth-error').textContent='Valide nome, e-mail, senha (mínimo 6) e confirmação.'; try { await api.register({nome:n,email:em,password:pw}); e.target.reset(); document.getElementById('auth-error').textContent='Cadastro realizado. Faça login.'; } catch(err) { document.getElementById('auth-error').textContent=err.mensagem || 'Falha no cadastro'; } };
    },
    pageCart() {
        const items=Cart.items(), app=document.getElementById('app');
        if (!this.state.user || this.state.user.perfil !== 'cliente') { app.innerHTML='<main class="cart-page"><h1>Carrinho</h1><p>É necessário entrar como cliente para finalizar a compra.</p></main>'; return; }
        app.innerHTML=`<main class="cart-page"><button id="cart-back">Voltar</button><h1>Revisar pedido</h1>${items.map(i=>`<article><h2>${this.escape(i.nome)}</h2><p>Estimativa: R$ ${(Cart.lineSubtotal(i)/100).toFixed(2)}</p><span>${i.quantity}</span></article>`).join('')||'<p>Carrinho vazio.</p>'}<p>Total estimado: R$ ${(Cart.total()/100).toFixed(2)}</p>${items.length?'<button id="checkout-action">Finalizar pedido</button>':''}<p id="checkout-feedback" role="status"></p></main>`;
        document.getElementById('cart-back').onclick=()=>this.go('storefront'); const button=document.getElementById('checkout-action'); if(button) button.onclick=async()=>{button.disabled=true;button.textContent='Finalizando...';try{const order=await api.checkout(Cart.items());Cart.clear();this.updateCartCount();document.getElementById('checkout-feedback').textContent=`Pedido confirmado. Total do servidor: R$ ${Number(order.total).toFixed(2)}`;}catch(e){button.disabled=false;button.textContent='Finalizar pedido';document.getElementById('checkout-feedback').textContent=this.escape(e.mensagem||'Falha ao finalizar pedido');}};
    },
    async pageOrders() { const app=document.getElementById('app'); app.innerHTML='<main class="orders-page"><button type="button" id="orders-back">Voltar ao catálogo</button><h1>Meus pedidos</h1><p role="status">Carregando pedidos...</p><div id="orders-list"></div></main>'; document.getElementById('orders-back').onclick=()=>this.go('storefront'); try { const orders=await api.getMyOrders(); const list=document.getElementById('orders-list'); list.innerHTML=orders.length?orders.map(o=>`<article><strong>Pedido ${this.escape(o.id)}</strong><p>Status: ${this.escape(o.status)} · Total: R$ ${Number(o.total).toFixed(2)} · ${this.escape(o.criado_em)}</p><button data-order="${this.escape(o.id)}">Detalhes</button></article>`).join(''):'<p>Nenhum pedido.</p>'; list.querySelectorAll('[data-order]').forEach(b=>b.onclick=async()=>{const o=await api.getMyOrder(b.dataset.order); document.getElementById('orders-list').insertAdjacentHTML('beforeend',`<pre>${this.escape(JSON.stringify(o.items,null,2))}</pre>`);}); } catch(e) { app.querySelector('[role=status]').textContent='Não foi possível carregar os pedidos.'; } },

    // ============ PARTS ============
    async pageParts() {
        document.getElementById('app').innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('parts')}</aside><main class="management-workspace">
            <div class="flex justify-between items-center mb-6">
                <h1 class="page-heading text-3xl font-bold">Catálogo de autopeças</h1>
                <button onclick="App.showAddPartModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all"><i class="fas fa-plus"></i> Nova peça</button>
            </div>
            <div class="flex gap-3 mb-6">
                <input type="text" id="search-input" placeholder="Buscar por nome ou código..." class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
                <button onclick="App.searchParts()" class="bg-slate-200 hover:bg-slate-300 px-4 py-2.5 rounded-lg font-medium transition-all"><i class="fas fa-search"></i></button>
            </div>
            <div id="parts-table" class="table-card bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"><p class="p-6 text-slate-400">Carregando...</p></div>
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
        } catch(e) { console.error(e); this.showFeedback('Erro ao buscar'); }
    },

    showAddPartModal() {
        const modal = document.createElement('div');
        modal.id = 'add-part-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 class="text-xl font-bold text-slate-900">Nova peça</h2>
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
                        <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all">Salvar peça</button>
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
            this.showFeedback(err.mensagem || 'Erro ao salvar peça');
        }
    },

    // ============ MOVEMENTS ============
    async pageMovements() {
        if (!['admin', 'operador', 'consulta'].includes(this.state.user?.perfil)) { this.go('storefront'); return; }
        document.getElementById('app').innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('movements')}</aside><main class="management-workspace operations-page"><header class="management-header"><div><p class="eyebrow">Estoque · demonstração</p><h1 class="page-heading">Movimentações</h1></div></header><p class="operations-note">Entradas, saídas manuais e pedidos feitos após esta atualização. O histórico mostra até 100 registros recentes; a carga inicial de pedidos não gerou movimentos de estoque.</p><div id="mov-content" role="status">Carregando movimentações...</div></main></div>`;
        try {
            const [partResult, historyResult] = await Promise.all([api.getParts(), api.getHistory()]);
            const parts = partResult.data || partResult;
            const history = historyResult.data || historyResult;
            const canEdit = ['admin', 'operador'].includes(this.state.user.perfil);
            const options = parts.filter(p => p.ativo !== false).map(p => `<option value="${this.escape(p._id)}">${this.escape(p.codigo)} — ${this.escape(p.nome)} (estoque ${this.escape(p.estoque_atual)})</option>`).join('');
            const form = canEdit ? `<section class="operations-panel"><h2>Registrar entrada ou saída</h2><form id="movement-form" class="movement-form"><label>Peça<select name="peca_id" required><option value="">Selecione uma peça</option>${options}</select></label><label>Tipo<select name="tipo" required><option value="entrada">Entrada</option><option value="saida">Saída</option></select></label><label>Quantidade<input name="quantidade" type="number" min="1" step="1" required></label><label>Motivo<input name="motivo" maxlength="200" required placeholder="Ex.: reposição de demonstração"></label><button type="submit">Registrar movimentação</button></form><p id="mov-feedback" role="status" aria-live="polite"></p></section>` : '';
            const rows = history.map(m => `<tr><td>${this.escape(new Date(m.criado_em).toLocaleString('pt-BR'))}</td><td><span class="movement-type ${m.tipo === 'entrada' ? 'movement-type--in' : 'movement-type--out'}">${this.escape(m.tipo)}</span></td><td>${this.escape(m.peca_nome || 'Peça indisponível')}</td><td class="num">${m.tipo === 'entrada' ? '+' : '−'}${this.escape(m.quantidade)}</td><td>${this.escape(m.usuario_nome || '—')}</td><td>${this.escape(m.motivo || '—')}</td></tr>`).join('');
            document.getElementById('mov-content').innerHTML = `${form}<section class="operations-panel"><h2>Histórico recente</h2><div class="operations-table"><table><thead><tr><th>Data</th><th>Tipo</th><th>Peça</th><th>Quantidade</th><th>Responsável</th><th>Motivo</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Nenhuma movimentação registrada ainda.</td></tr>'}</tbody></table></div></section>`;
            const movementForm = document.getElementById('movement-form');
            if (movementForm) movementForm.onsubmit = async event => {
                event.preventDefault();
                const values = Object.fromEntries(new FormData(event.target));
                const quantidade = Number(values.quantidade);
                const feedback = document.getElementById('mov-feedback');
                if (!Number.isSafeInteger(quantidade) || quantidade <= 0) { feedback.textContent = 'Informe uma quantidade inteira positiva.'; return; }
                const button = movementForm.querySelector('button[type="submit"]');
                button.disabled = true;
                try {
                    const payload = { peca_id: values.peca_id, quantidade, motivo: values.motivo.trim() };
                    await (values.tipo === 'entrada' ? api.recordEntry(payload) : api.recordExit(payload));
                    await this.pageMovements();
                    document.getElementById('mov-feedback').textContent = 'Movimentação registrada e estoque atualizado.';
                } catch (error) { feedback.textContent = error.mensagem || 'Não foi possível registrar a movimentação.'; }
                finally { button.disabled = false; }
            };
        } catch (error) { document.getElementById('mov-content').textContent = error.mensagem || 'Erro ao carregar movimentações.'; }
    },

    // ============ REPORTS ============
    async pageReports() {
        if (!['admin', 'operador', 'consulta'].includes(this.state.user?.perfil)) { this.go('storefront'); return; }
        document.getElementById('app').innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('reports')}</aside><main class="management-workspace operations-page"><header class="management-header"><div><p class="eyebrow">Indicadores · demonstração</p><h1 class="page-heading">Relatórios</h1></div></header><div id="reports-content" role="status">Carregando relatórios...</div></main></div>`;
        try {
            const [partResult, historyResult, orders] = await Promise.all([
                api.getParts(), api.getHistory(),
                this.state.user.perfil === 'admin' ? api.admin.listOrders() : Promise.resolve(null)
            ]);
            const parts = partResult.data || partResult;
            const history = historyResult.data || historyResult;
            const summary = this.summarizeOperations(parts, history);
            const money = n => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const low = parts.filter(p => p.ativo !== false && Number(p.estoque_atual) <= Number(p.estoque_minimo))
                .sort((a, b) => Number(a.estoque_atual) - Number(b.estoque_atual)).slice(0, 8);
            const cards = [
                ['Peças ativas', summary.totalProducts], ['Unidades em estoque', summary.stockUnits],
                ['Estoque baixo', summary.lowStock], ['Sem estoque', summary.outOfStock]
            ].map(([label, value]) => `<article class="report-card"><span>${label}</span><strong>${this.escape(value)}</strong></article>`).join('');
            const maxMovements = Math.max(1, summary.entries, summary.exits);
            const bar = (label, count, units, type) => `<div class="report-bar"><div><strong>${label}</strong><span>${count} registros · ${units} unidades</span></div><div class="report-track"><span class="${type}" style="width:${count / maxMovements * 100}%"></span></div></div>`;
            const rows = low.map(p => `<tr><td>${this.escape(p.codigo)}</td><td>${this.escape(p.nome)}</td><td class="num">${this.escape(p.estoque_atual)}</td><td class="num">${this.escape(p.estoque_minimo)}</td></tr>`).join('');
            const ordersPanel = orders ? `<section class="operations-panel"><h2>Pedidos simulados</h2><p><strong>${orders.length}</strong> pedidos registrados · <strong>${orders.filter(o => o.status === 'pendente').length}</strong> pendentes.</p><p class="operations-note">Solicitações acadêmicas, sem pagamento ou faturamento real.</p></section>` : '';
            const unusualCodes = parts.filter(p => p.ativo !== false && Number(p.estoque_atual) > 1000)
                .slice(0, 3).map(p => this.escape(p.codigo)).join(', ');
            const warning = summary.highStock ? `<p class="operations-warning" role="status">Atenção: ${summary.highStock} peça(s) têm mais de 1.000 unidades em estoque (${unusualCodes}). Esses cadastros elevam os totais; confira os números antes da apresentação.</p>` : '';
            document.getElementById('reports-content').innerHTML = `<p class="operations-note">Valores estimados do estoque a preço de catálogo, não receita nem vendas. Movimentações consideram apenas os últimos 100 registros; a carga inicial de pedidos não possui histórico de estoque.</p><div class="report-cards">${cards}</div>${warning}<section class="operations-panel"><h2>Estoque a preço de catálogo</h2><strong class="report-value">R$ ${money(summary.stockValue)}</strong><p class="operations-note">Estimativa: unidades atuais × preço de venda. Não é faturamento.</p></section><section class="operations-panel"><h2>Movimentações recentes</h2>${bar('Entradas', summary.entries, summary.unitsIn, 'report-in')}${bar('Saídas', summary.exits, summary.unitsOut, 'report-out')}${history.length ? '' : '<p>Nenhuma movimentação registrada ainda.</p>'}</section>${ordersPanel}<section class="operations-panel"><h2>Peças com estoque baixo</h2><div class="operations-table"><table><thead><tr><th>Código</th><th>Peça</th><th>Atual</th><th>Mínimo</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Nenhum alerta de estoque.</td></tr>'}</tbody></table></div></section>`;
        } catch (error) { document.getElementById('reports-content').textContent = error.mensagem || 'Erro ao carregar relatórios.'; }
    },

    // ============ USERS ============
    async pageUsers() {
        document.getElementById('app').innerHTML = `
        <div class="management-shell">
            <aside class="management-sidebar">${this.sidebar('users')}</aside>
            <main class="management-workspace">
                <div class="flex justify-between items-center mb-6">
                    <h1 class="page-heading text-3xl font-bold">Equipe e acessos</h1>
                    <button onclick="App.showAddUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all">
                        <i class="fas fa-user-plus"></i> Novo Usuário
                    </button>
                </div>
                <div id="users-content" class="table-card bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                this.showFeedback(err.mensagem || `Erro ${err.codigo || ''}: Falha ao criar usuário. Verifique se o e-mail já existe.`);
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
        if (!window.confirm('Alterar status deste usuário?')) return;
        try {
            await api.toggleUserStatus(id);
            this.pageUsers();
        } catch(e) { this.showFeedback(e.mensagem || 'Não foi possível concluir a operação.'); }
    },

    logout() { localStorage.removeItem('token'); this.state.user = null; this.go('storefront'); }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}
