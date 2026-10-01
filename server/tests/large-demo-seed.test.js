const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { CATEGORIES, SUPPLIER_COUNT, makePart, makeOrder, assertLocalDemoUri } = require('../seed-large');

const ids = Array.from({ length: CATEGORIES.length }, () => new mongoose.Types.ObjectId());
const vendors = Array.from({ length: SUPPLIER_COUNT }, () => new mongoose.Types.ObjectId());

test('600 demo products have unique stable codes, varied stock, valid references and fictional compatibility', async () => {
    const products = Array.from({ length: 600 }, (_, index) => makePart(index, ids, vendors));
    assert.equal(new Set(products.map(p => p.codigo)).size, 600);
    assert.deepEqual(makePart(7, ids, vendors), makePart(7, ids, vendors));
    assert.ok(products.some(p => p.estoque_atual === 0));
    assert.ok(products.some(p => p.estoque_atual > 0));
    assert.ok(new Set(products.map(p => String(p.categoria_id))).size >= 10);
    assert.ok(products.every(p => /Demo/.test(p.compatibilidades[0].marca)));
    const Peca = require('../src/models/Part');
    for (const p of products) await new Peca(p).validate();
});

test('synthetic order has deterministic identity, valid snapshots and consistent total', async () => {
    const customer = new mongoose.Types.ObjectId();
    const products = [makePart(0, ids, vendors), makePart(1, ids, vendors)].map(p => ({ ...p, _id: new mongoose.Types.ObjectId() }));
    const order = makeOrder(3, customer, products);
    assert.equal(String(order._id), String(makeOrder(3, customer, products)._id));
    assert.equal(order.total, order.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));
    await new (require('../src/models/Order'))(order).validate();
});

test('CLI write safety only accepts explicit loopback AutoPart demo database', () => {
    assert.doesNotThrow(() => assertLocalDemoUri('mongodb://127.0.0.1:27017/autopart_sync'));
    for (const uri of ['mongodb://localhost:27018/autopart_fase1_test', 'mongodb://db.example.test:27017/autopart_sync', 'mongodb://127.0.0.1:27017/admin', 'mongodb://127.0.0.1:27017/autopart_sync?replicaSet=rs0']) {
        assert.throws(() => assertLocalDemoUri(uri));
    }
});
