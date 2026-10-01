const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8');

function appHarness(api = { getMyOrders: async () => [] }) {
    const nodes = new Map();
    const root = { _html: '' };
    Object.defineProperty(root, 'innerHTML', { get() { return this._html; }, set(value) {
        this._html = value;
        if (value.includes('id="orders-back"')) nodes.set('orders-back', { onclick: null });
        if (value.includes('id="orders-list"')) nodes.set('orders-list', { innerHTML: '', querySelectorAll: () => [] });
    } });
    nodes.set('app', root);
    const document = { readyState: 'loading', addEventListener() {}, getElementById: id => nodes.get(id) };
    const context = vm.createContext({ document, api, console, localStorage: { getItem: () => null } });
    vm.runInContext(source + '\nglobalThis.TestApp = App;', context);
    return { App: context.TestApp, nodes, root };
}

test('customer orders has a working back-to-catalogue button even when history is empty', async () => {
    const { App, nodes, root } = appHarness();
    App.go = page => { App.state.page = page; };
    await App.pageOrders();
    assert.match(root.innerHTML, /id="orders-back"/);
    assert.match(root.innerHTML, /Voltar ao catálogo/);
    assert.equal(typeof nodes.get('orders-back').onclick, 'function');
    nodes.get('orders-back').onclick();
    assert.equal(App.state.page, 'storefront');
});

test('management report summarizes stock and recorded movements without claiming sales', () => {
    const { App } = appHarness();
    const rows = [
        { ativo: true, estoque_atual: 0, estoque_minimo: 5, preco_venda: 10 },
        { ativo: true, estoque_atual: 3, estoque_minimo: 5, preco_venda: 20 },
        { ativo: true, estoque_atual: 8, estoque_minimo: 5, preco_venda: 30 },
        { ativo: false, estoque_atual: 100, estoque_minimo: 5, preco_venda: 50 }
    ];
    const history = [{ tipo: 'entrada', quantidade: 7 }, { tipo: 'saida', quantidade: 2 }, { tipo: 'saida', quantidade: 1 }];
    const result = App.summarizeOperations(rows, history);
    assert.equal(result.totalProducts, 3);
    assert.equal(result.stockUnits, 11);
    assert.equal(result.lowStock, 2);
    assert.equal(result.outOfStock, 1);
    assert.equal(result.stockValue, 300);
    assert.equal(result.entries, 1);
    assert.equal(result.exits, 2);
    assert.equal(result.unitsIn, 7);
    assert.equal(result.unitsOut, 3);
    assert.equal(result.highStock, 0);
    assert.equal(App.summarizeOperations([{ ativo: true, estoque_atual: 1200, estoque_minimo: 5, preco_venda: 10 }], []).highStock, 1);
});
