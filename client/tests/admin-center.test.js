const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(__dirname + '/../js/app.js', 'utf8');
const context = vm.createContext({ document: { readyState: 'loading', addEventListener() {} }, console });
vm.runInContext(source + '\nglobalThis.AppUnderTest = App;', context);
const App = context.AppUnderTest;

test('admin central stays in sidebar and is highlighted on its own page', () => {
    App.state.user = { perfil: 'admin', nome: 'Demo' };
    const menu = App.sidebar('admin-management');
    assert.match(menu, /class="nav-item is-active"[^>]*>Central de operações<\/button>/);
    assert.match(menu, /Visão geral/);
    assert.match(menu, /Relatórios/);
    const central = source.slice(source.indexOf('async pageAdminManagement'), source.indexOf('showEditProductModal'));
    assert.match(central, /<aside class="management-sidebar">/);
    App.state.user = { perfil: 'cliente', nome: 'Demo' };
    assert.doesNotMatch(App.sidebar('dashboard'), /Central de operações/);
});

test('admin product list is searchable, excludes inactive by default and paginates', () => {
    const products = Array.from({ length: 600 }, (_, i) => ({ codigo: 'DEMO-' + String(i + 1).padStart(4, '0'), nome: 'Peça ' + i, ativo: true }));
    products[3].ativo = false;
    const first = App.paginateAdminRows(products, { size: 12 });
    assert.equal(first.items.length, 12);
    assert.equal(first.total, 599);
    assert.equal(first.pages, 50);
    const second = App.paginateAdminRows(products, { page: 2, size: 12 });
    assert.equal(second.items[0].codigo, 'DEMO-0014');
    const filtered = App.paginateAdminRows(products, { query: 'demo-0560', size: 12 });
    assert.equal(filtered.total, 1);
    assert.equal(filtered.items[0].codigo, 'DEMO-0560');
    assert.equal(App.paginateAdminRows(products, { query: 'demo-0004', includeInactive: true }).total, 1);
    const clamped = App.paginateAdminRows(products, { page: 999, size: 12 });
    assert.equal(clamped.page, clamped.pages);
});

test('order status options only expose allowed transitions', () => {
    assert.deepEqual(Array.from(App.allowedOrderStatuses('pendente')), ['confirmado', 'cancelado']);
    assert.deepEqual(Array.from(App.allowedOrderStatuses('enviado')), ['concluido']);
    assert.equal(App.allowedOrderStatuses('concluido').length, 0);
});
