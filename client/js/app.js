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
    stockDistribution(parts) {
        const active = (parts || []).filter(p => p.ativo !== false);
        const zero = active.filter(p => Number(p.estoque_atual) <= 0).length;
        const low = active.filter(p => Number(p.estoque_atual) > 0 && Number(p.estoque_atual) <= Number(p.estoque_minimo)).length;
        return { zero, low, healthy: active.length - zero - low, total: active.length };
    },
    renderStockChart(parts) {
        const d = this.stockDistribution(parts);
        if (!d.total) return '<section class="operations-panel"><h2>Distribuição do estoque</h2><p>Nenhuma peça ativa cadastrada.</p></section>';
        const healthy = d.healthy / d.total * 100, lowEnd = (d.healthy + d.low) / d.total * 100;
        const legend = [['Adequado', d.healthy, 'healthy'], ['Baixo', d.low, 'low'], ['Sem estoque', d.zero, 'zero']];
        return `<section class="analytics-panel"><div class="analytics-title"><div><p class="eyebrow">Leitura do estoque</p><h2>Distribuição por situação</h2></div><span>Peças ativas</span></div><div class="analytics-layout"><div class="stock-donut" aria-hidden="true" style="--healthy:${healthy}%;--low-end:${lowEnd}%"><div><strong>${d.total}</strong><span>peças</span></div></div><div class="analytics-legend">${legend.map(([name,count,tone])=>`<div class="analytics-row"><div><span><i class="key-${tone}"></i>${name}</span><strong>${count} <small>· ${Math.round(count / d.total * 100)}%</small></strong></div><div class="analytics-track"><span class="key-${tone}" style="width:${count / d.total * 100}%"></span></div></div>`).join('')}</div></div><p class="operations-note">Baixo: acima de zero e até o mínimo cadastrado. Sem estoque: zero unidades.</p></section>`;
    },
    toCsv(rows) {
        return '\ufeff' + rows.map(row => row.map(value => {
            let cell = String(value ?? '');
            if (/^[\s\u0000-\u001f]*[=+\-@]/.test(cell)) cell = "'" + cell;
            return '"' + cell.replace(/"/g, '""') + '"';
        }).join(',')).join('\r\n');
    },
    downloadReport(rows) {
        const blob = new Blob([this.toCsv(rows)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = 'autopart-relatorio-estoque.csv';
        document.body.appendChild(anchor); anchor.click(); anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
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
        this.closeAddPartModal();
        this.closeUserModal();
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
        if (!['admin', 'operador', 'consulta'].includes(this.state.user?.perfil)) { this.go('storefront'); return; }
        const app = document.getElementById('app');
        app.innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('dashboard')}</aside><main class="management-workspace operations-page"><header class="management-header"><div><p class="eyebrow">AutoPart Gestão · demonstração</p><h1 class="page-heading">Visão geral</h1><p class="parts-subtitle">Um resumo do estoque e atalhos para sua operação.</p></div></header><div id="dashboard-content" role="status" aria-live="polite">Carregando resumo...</div><section class="operations-panel"><h2>Acesso rápido</h2><div class="overview-links"><button type="button" onclick="App.go('parts')">Peças e catálogo <span>Consultar estoque →</span></button><button type="button" onclick="App.go('movements')">Movimentações <span>Ver histórico →</span></button><button type="button" onclick="App.go('reports')">Relatórios <span>Ver indicadores →</span></button>${this.state.user.perfil === 'admin' ? `<button type="button" onclick="App.go('admin-management')">Central de operações <span>Produtos e pedidos →</span></button>` : ''}</div></section><p class="operations-note">Acesso atual: ${this.escape(this.state.user.nome || 'Usuário')} · ${this.escape(this.state.user.perfil)}</p></main></div>`;
        const target = document.getElementById('dashboard-content');
        try {
            const result = await api.getParts();
            if (!target.isConnected) return;
            const parts = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
            const summary = this.summarizeOperations(parts, []);
            target.innerHTML = `<div class="report-cards">${[['Peças ativas', summary.totalProducts], ['Unidades em estoque', summary.stockUnits], ['Estoque baixo (inclui zerado)', summary.lowStock], ['Sem estoque', summary.outOfStock]].map(([label, value]) => `<article class="report-card"><span>${label}</span><strong>${this.escape(value)}</strong></article>`).join('')}</div>${this.renderStockChart(parts)}`;
        } catch (error) {
            if (target.isConnected) target.textContent = error.mensagem || 'Não foi possível carregar o resumo de estoque.';
        }
    },
    pageAccount() { this.pageLogin(true); },
    pageLogin(account = false) {
        document.getElementById('app').innerHTML = `<main class="auth-surface"><h1 class="auth-brand"><img src="/favicon.svg" alt="" width="46" height="46"><span>AutoPart</span></h1><form id="login-form"><h2>Entrar</h2><input id="email" type="email" required placeholder="E-mail"><input id="password" type="password" required placeholder="Senha"><button>Entrar</button><p id="auth-error" role="alert"></p></form><form id="register-form"><h2>Criar conta</h2><input id="register-nome" required placeholder="Nome"><input id="register-email" type="email" required placeholder="E-mail"><input id="register-password" type="password" required minlength="6" placeholder="Senha (mínimo 6)"><input id="register-confirm" type="password" required minlength="6" placeholder="Confirme a senha"><button>Cadastrar</button></form><button id="back-store">Voltar ao catálogo</button></main>`;
        document.getElementById('back-store').onclick = () => this.go('storefront');
        document.getElementById('login-form').onsubmit = async e => { e.preventDefault(); try { const res = await api.login({email:email.value,password:password.value}); localStorage.setItem('token',res.token); this.state.user=res.user; this.go(res.user?.perfil === 'admin' ? 'admin-management' : res.user?.perfil === 'cliente' ? 'storefront' : 'dashboard'); } catch(err) { document.getElementById('auth-error').textContent = err.mensagem || 'Falha na autenticação'; } };
        document.getElementById('register-form').onsubmit = async e => { e.preventDefault(); const n=document.getElementById('register-nome').value.trim(), em=document.getElementById('register-email').value.trim(), pw=document.getElementById('register-password').value, cf=document.getElementById('register-confirm').value; if(!n || !em || pw.length<6 || pw!==cf) return document.getElementById('auth-error').textContent='Valide nome, e-mail, senha (mínimo 6) e confirmação.'; try { await api.register({nome:n,email:em,password:pw}); e.target.reset(); document.getElementById('auth-error').textContent='Cadastro realizado. Faça login.'; } catch(err) { document.getElementById('auth-error').textContent=err.mensagem || 'Falha no cadastro'; } };
    },
    pageCart() {
        const items = Cart.items(), app = document.getElementById('app');
        if (!this.state.user || this.state.user.perfil !== 'cliente') {
            app.innerHTML = '<main class="cart-page"><button type="button" id="cart-back">Voltar ao catálogo</button><h1>Carrinho</h1><p>É necessário entrar como cliente para finalizar o pedido.</p><button type="button" id="cart-login">Entrar como cliente</button></main>';
            document.getElementById('cart-back').onclick = () => this.go('storefront');
            document.getElementById('cart-login').onclick = () => this.go('login');
            return;
        }
        app.innerHTML = `<main class="cart-page"><button type="button" id="cart-back">Voltar ao catálogo</button><h1>Revisar pedido</h1>${items.map(i=>`<article><h2>${this.escape(i.nome)}</h2><p>Estimativa: R$ ${(Cart.lineSubtotal(i)/100).toFixed(2)}</p><span>Quantidade: ${i.quantity}</span></article>`).join('')||'<p>Carrinho vazio.</p>'}<p>Total estimado: R$ ${(Cart.total()/100).toFixed(2)}</p>${items.length?'<button id="checkout-action">Finalizar pedido</button>':''}<p id="checkout-feedback" role="status"></p></main>`;
        document.getElementById('cart-back').onclick = () => this.go('storefront');
        const button = document.getElementById('checkout-action');
        if (button) button.onclick = async () => {
            button.disabled = true; button.textContent = 'Finalizando...';
            try {
                const order = await api.checkout(Cart.items());
                Cart.clear();
                this.updateCartCount();
                if (button.isConnected) {
                    this.pageCart();
                    document.getElementById('checkout-feedback').textContent = `Pedido confirmado. Total do servidor: R$ ${Number(order.total).toFixed(2)}`;
                }
            } catch (error) {
                if (button.isConnected) { button.disabled = false; button.textContent = 'Finalizar pedido'; document.getElementById('checkout-feedback').textContent = error.mensagem || 'Falha ao finalizar pedido'; }
            }
        };
    },
    async pageOrders() {
        const app = document.getElementById('app');
        app.innerHTML = '<main class="orders-page"><button type="button" id="orders-back">Voltar ao catálogo</button><h1>Meus pedidos</h1><p role="status">Carregando pedidos...</p><div id="orders-list"></div><section id="order-detail" aria-live="polite"></section></main>';
        document.getElementById('orders-back').onclick = () => this.go('storefront');
        const status = app.querySelector('[role=status]'), list = document.getElementById('orders-list');
        try {
            const orders = await api.getMyOrders();
            if (!list.isConnected) return;
            status.textContent = '';
            list.innerHTML = orders.length ? orders.map(o => `<article><strong>Pedido ${this.escape(o.id)}</strong><p>Status: ${this.escape(o.status)} · Total: R$ ${Number(o.total).toFixed(2)} · ${this.escape(new Date(o.criado_em).toLocaleString('pt-BR'))}</p><button type="button" data-order="${this.escape(o.id)}">Detalhes</button></article>`).join('') : '<p>Nenhum pedido.</p>';
            list.querySelectorAll('[data-order]').forEach(button => button.onclick = async () => {
                const detail = document.getElementById('order-detail');
                if (!detail) return;
                detail.textContent = 'Carregando detalhes...';
                try {
                    const order = await api.getMyOrder(button.dataset.order);
                    if (!detail.isConnected) return;
                    detail.innerHTML = `<h2>Detalhes do pedido</h2><ul>${order.items.map(item => `<li>${this.escape(item.partName)} · ${this.escape(item.quantity)} × R$ ${Number(item.unitPrice).toFixed(2)}</li>`).join('')}</ul><strong>Total: R$ ${Number(order.total).toFixed(2)}</strong>`;
                } catch (error) { if (detail.isConnected) detail.textContent = error.mensagem || 'Não foi possível carregar os detalhes.'; }
            });
        } catch (error) { if (status.isConnected) status.textContent = error.mensagem || 'Não foi possível carregar os pedidos.'; }
    },

    // ============ PARTS ============
    filterParts(parts, query) {
        const term = String(query || '').trim().toLocaleLowerCase();
        return parts.filter(p => !term || [p.nome, p.codigo].some(v => String(v || '').toLocaleLowerCase().includes(term)));
    },
    async pageParts() {
        if (!['admin', 'operador', 'consulta'].includes(this.state.user?.perfil)) { this.go('storefront'); return; }
        const app = document.getElementById('app');
        const canCreate = ['admin', 'operador'].includes(this.state.user.perfil);
        app.innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('parts')}</aside><main class="management-workspace parts-page"><header class="management-header"><div><p class="eyebrow">Estoque · demonstração</p><h1 class="page-heading">Peças e catálogo</h1><p class="parts-subtitle">Consulte as peças e acompanhe o estoque atual.</p></div>${canCreate ? '<button type="button" class="parts-primary" id="part-create">+ Nova peça</button>' : ''}</header><section class="operations-panel"><label class="parts-search-label" for="search-input">Buscar por nome ou código</label><input id="search-input" class="parts-search" type="search" placeholder="Digite para buscar..." autocomplete="off"><p id="parts-count" class="parts-count" role="status" aria-live="polite">Carregando peças...</p><div id="parts-table" class="operations-table"></div></section></main></div>`;
        const input = document.getElementById('search-input');
        const table = document.getElementById('parts-table');
        const count = document.getElementById('parts-count');
        document.getElementById('part-create')?.addEventListener('click', () => this.showAddPartModal());
        let parts = null;
        const render = () => {
            if (!parts) return;
            const filtered = this.filterParts(parts, input.value);
            count.textContent = `${filtered.length} peça(s) encontrada(s)`;
            const rows = filtered.map(p => `<tr><td>${this.escape(p.codigo)}</td><td>${this.escape(p.nome)}</td><td>${this.escape(p.categoria || '—')}</td><td>${this.escape(p.estoque_atual)}</td><td>R$ ${Number(p.preco_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td><span class="part-status ${Number(p.estoque_atual) <= Number(p.estoque_minimo) ? 'part-status--low' : ''}">${Number(p.estoque_atual) <= Number(p.estoque_minimo) ? 'Baixo' : 'OK'}</span></td></tr>`).join('');
            table.innerHTML = `<table><thead><tr><th>Código</th><th>Nome</th><th>Categoria</th><th>Estoque</th><th>Preço</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="6">Nenhuma peça encontrada.</td></tr>'}</tbody></table>`;
        };
        input.addEventListener('input', render);
        try {
            const result = await api.getParts();
            if (!input.isConnected) return;
            parts = Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
            render();
        } catch (error) {
            if (count.isConnected) count.textContent = error.mensagem || 'Não foi possível carregar as peças.';
        }
    },
    showAddPartModal() {
        if (document.getElementById('add-part-modal')) return;
        const previousFocus = document.activeElement;
        const modal = document.createElement('div');
        modal.id = 'add-part-modal';
        modal.className = 'part-modal';
        modal.innerHTML = `<div class="part-modal-card" role="dialog" aria-modal="true" aria-labelledby="part-modal-title"><header class="part-modal-header"><div><p class="eyebrow">Catálogo</p><h2 id="part-modal-title">Nova peça</h2></div><button type="button" class="part-modal-close" aria-label="Fechar">×</button></header><form id="add-part-form" class="part-form"><label class="part-wide">Nome da peça<input name="nome" required maxlength="160" placeholder="Ex.: Pastilha de freio"></label><label>Código<input name="codigo" required maxlength="60" placeholder="Ex.: PF-001"></label><label>Descrição<input name="descricao" maxlength="400" placeholder="Descrição da peça"></label><label>Preço de custo (R$)<input name="preco_custo" type="number" min="0" step="0.01" required></label><label>Preço de venda (R$)<input name="preco_venda" type="number" min="0" step="0.01" required></label><label>Estoque inicial<input name="estoque_atual" type="number" min="0" step="1" required></label><label>Estoque mínimo<input name="estoque_minimo" type="number" min="0" step="1" required value="5"></label><p id="part-form-error" class="part-form-error part-wide" role="alert"></p><div class="part-modal-actions part-wide"><button type="button" class="part-cancel">Cancelar</button><button type="submit" class="parts-primary">Salvar peça</button></div></form></div>`;
        const onKeydown = e => {
            if (e.key === 'Escape') { e.preventDefault(); this.closeAddPartModal(); return; }
            if (e.key === 'Tab') {
                const items = [...modal.querySelectorAll('button:not([disabled]), input:not([disabled])')];
                if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); items[items.length - 1].focus(); }
                else if (!e.shiftKey && document.activeElement === items[items.length - 1]) { e.preventDefault(); items[0].focus(); }
            }
        };
        this._partModalCleanup = () => { document.removeEventListener('keydown', onKeydown); if (previousFocus?.isConnected) previousFocus.focus(); };
        document.addEventListener('keydown', onKeydown);
        modal.addEventListener('click', e => { if (e.target === modal) this.closeAddPartModal(); });
        document.body.appendChild(modal);
        modal.querySelector('.part-modal-close').onclick = () => this.closeAddPartModal();
        modal.querySelector('.part-cancel').onclick = () => this.closeAddPartModal();
        modal.querySelector('form').onsubmit = e => this.savePart(e);
        modal.querySelector('input[name="nome"]').focus();
    },
    closeAddPartModal() {
        document.getElementById('add-part-modal')?.remove();
        this._partModalCleanup?.();
        this._partModalCleanup = null;
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

        const button = e.target.querySelector('button[type="submit"]');
        const ownerModal = e.target.closest('#add-part-modal');
        const errorPanel = document.getElementById('part-form-error');
        button.disabled = true;
        try {
            await api.createPart(data);
            if (ownerModal?.isConnected) {
                this.closeAddPartModal();
                if (this.state.page === 'parts') this.pageParts();
            }
        } catch (err) {
            if (errorPanel?.isConnected) errorPanel.textContent = err.mensagem || 'Erro ao salvar peça';
        } finally { button.disabled = false; }
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
            document.getElementById('reports-content').innerHTML = `<div class="report-actions"><button type="button" class="parts-primary" id="report-csv">↓ Exportar CSV</button><button type="button" class="part-cancel" id="report-print">Imprimir / salvar PDF</button></div><p class="operations-note">Valores estimados do estoque a preço de catálogo, não receita nem vendas. Movimentações consideram apenas os últimos 100 registros; a carga inicial de pedidos não possui histórico de estoque.</p><div class="report-cards">${cards}</div>${warning}${this.renderStockChart(parts)}<section class="operations-panel"><h2>Estoque a preço de catálogo</h2><strong class="report-value">R$ ${money(summary.stockValue)}</strong><p class="operations-note">Estimativa: unidades atuais × preço de venda. Não é faturamento.</p></section><section class="operations-panel"><h2>Movimentações recentes</h2>${bar('Entradas', summary.entries, summary.unitsIn, 'report-in')}${bar('Saídas', summary.exits, summary.unitsOut, 'report-out')}${history.length ? '' : '<p>Nenhuma movimentação registrada ainda.</p>'}</section>${ordersPanel}<section class="operations-panel"><h2>Peças com estoque baixo</h2><div class="operations-table"><table><thead><tr><th>Código</th><th>Peça</th><th>Atual</th><th>Mínimo</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Nenhum alerta de estoque.</td></tr>'}</tbody></table></div></section>`;
            const csvRows = [['Relatório de estoque AutoPart'], ['Gerado em', new Date().toLocaleString('pt-BR')], ['Aviso', 'Estoque a preço de catálogo; não representa vendas ou receita. Movimentações: últimos 100 registros.'], ['Peças ativas', summary.totalProducts], ['Unidades em estoque', summary.stockUnits], ['Estoque baixo (inclui zerado)', summary.lowStock], ['Sem estoque', summary.outOfStock], ['Valor estimado do estoque (R$)', summary.stockValue], ['Entradas recentes (registros)', summary.entries], ['Saídas recentes (registros)', summary.exits], [], ['Código', 'Peça', 'Estoque atual', 'Estoque mínimo', 'Preço de catálogo (R$)'], ...parts.filter(p => p.ativo !== false).map(p => [p.codigo, p.nome, p.estoque_atual, p.estoque_minimo, p.preco_venda])];
            document.getElementById('report-csv').onclick = () => this.downloadReport(csvRows);
            document.getElementById('report-print').onclick = () => window.print();
        } catch (error) { document.getElementById('reports-content').textContent = error.mensagem || 'Erro ao carregar relatórios.'; }
    },

    // ============ USERS ============
    async pageUsers() {
        if (this.state.user?.perfil !== 'admin') { this.go('storefront'); return; }
        const app = document.getElementById('app');
        app.innerHTML = `<div class="management-shell"><aside class="management-sidebar">${this.sidebar('users')}</aside><main class="management-workspace operations-page"><header class="management-header"><div><p class="eyebrow">Equipe · demonstração</p><h1 class="page-heading">Usuários e acessos</h1><p class="parts-subtitle">Consulte a equipe e seus perfis de acesso.</p></div><button type="button" class="parts-primary" id="user-add">+ Novo usuário</button></header><p id="users-feedback" role="status" aria-live="polite"></p><section class="operations-panel"><h2>Equipe cadastrada</h2><div id="users-content" class="operations-table" role="status">Carregando usuários...</div></section></main></div><div id="modal-user" class="part-modal" hidden><div class="part-modal-card" role="dialog" aria-modal="true" aria-labelledby="user-modal-title"><header class="part-modal-header"><div><p class="eyebrow">Equipe</p><h2 id="user-modal-title">Novo usuário</h2></div><button type="button" class="part-modal-close" aria-label="Fechar">×</button></header><form id="user-form" class="part-form"><label class="part-wide">Nome completo<input type="text" id="user-nome" required autocomplete="name"></label><label class="part-wide">E-mail<input type="email" id="user-email" required autocomplete="off"></label><label class="part-wide">Senha provisória<input type="password" id="user-password" required minlength="6" autocomplete="new-password"></label><label class="part-wide">Perfil de acesso<select id="user-perfil" required><option value="consulta">Consulta (apenas leitura)</option><option value="operador">Operador (estoque)</option><option value="admin">Administrador (total)</option></select></label><p id="user-modal-error" class="part-form-error part-wide" role="alert"></p><div class="part-modal-actions part-wide"><button type="button" class="part-cancel">Cancelar</button><button type="submit" class="parts-primary">Cadastrar usuário</button></div></form></div></div>`;
        const modal = document.getElementById('modal-user');
        const userContent = document.getElementById('users-content');
        document.getElementById('user-add').onclick = () => this.showAddUserModal();
        modal.querySelector('.part-modal-close').onclick = () => this.closeUserModal();
        modal.querySelector('.part-cancel').onclick = () => this.closeUserModal();
        modal.addEventListener('click', e => { if (e.target === modal) this.closeUserModal(); });
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const form = e.target, button = form.querySelector('button[type="submit"]');
            const error = document.getElementById('user-modal-error');
            const data = { nome: form.querySelector('#user-nome').value.trim(), email: form.querySelector('#user-email').value.trim(), password: form.querySelector('#user-password').value, perfil: form.querySelector('#user-perfil').value };
            button.disabled = true; error.textContent = '';
            try {
                await api.createUser(data);
                if (!modal.isConnected) return;
                this.closeUserModal();
                await this.pageUsers();
                const feedback = document.getElementById('users-feedback');
                if (feedback) feedback.textContent = 'Usuário cadastrado com sucesso.';
            } catch (err) { if (error.isConnected) error.textContent = err.mensagem || 'Não foi possível cadastrar o usuário.'; }
            finally { button.disabled = false; }
        };
        try {
            const users = await api.getUsers();
            if (!userContent.isConnected) return;
            const rows = users.map(u => `<tr><td><strong>${this.escape(u.nome)}</strong><br><small>${this.escape(u.email)}</small></td><td>${this.escape(u.perfil)}</td><td><span class="part-status ${u.ativo ? '' : 'part-status--low'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td><td><button type="button" class="part-cancel" data-toggle-user="${this.escape(u._id)}">${u.ativo ? 'Desativar' : 'Ativar'}</button></td></tr>`).join('');
            userContent.innerHTML = `<table><thead><tr><th>Usuário</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Nenhum usuário cadastrado.</td></tr>'}</tbody></table>`;
            userContent.querySelectorAll('[data-toggle-user]').forEach(button => { button.onclick = () => this.toggleUser(button.dataset.toggleUser); });
        } catch (error) { if (userContent.isConnected) userContent.textContent = error.mensagem || 'Não foi possível carregar os usuários.'; }
    },
    showAddUserModal() {
        const modal = document.getElementById('modal-user');
        if (!modal || !modal.hidden) return;
        const previousFocus = document.activeElement;
        modal.hidden = false;
        const keydown = event => {
            if (event.key === 'Escape') { event.preventDefault(); this.closeUserModal(); return; }
            if (event.key === 'Tab') {
                const items = [...modal.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled])')];
                if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
                else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
            }
        };
        this._userModalCleanup = () => { document.removeEventListener('keydown', keydown); if (previousFocus?.isConnected) previousFocus.focus(); };
        document.addEventListener('keydown', keydown);
        modal.querySelector('#user-nome').focus();
    },
    closeUserModal() {
        const modal = document.getElementById('modal-user');
        if (modal) { modal.hidden = true; modal.querySelector('form')?.reset(); }
        this._userModalCleanup?.();
        this._userModalCleanup = null;
    },
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
