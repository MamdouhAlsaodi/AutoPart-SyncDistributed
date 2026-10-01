const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Peca = require('../src/models/Part');
const Order = require('../src/models/Order');
const Movimentacao = require('../src/models/Movement');
const OrdersController = require('../src/controllers/OrdersController');

test('checkout writes stock exit movement in the same transaction as order and stock update', async () => {
    const original = { startSession: mongoose.startSession, find: Peca.find, updateOne: Peca.updateOne,
        orderCreate: Order.create, movementCreate: Movimentacao.create };
    const partId = new mongoose.Types.ObjectId();
    const orderId = new mongoose.Types.ObjectId();
    const actor = new mongoose.Types.ObjectId().toString();
    const session = { async withTransaction(action) { await action(); }, async endSession() {} };
    const actions = [];
    let movementDocs, movementOptions;
    mongoose.startSession = async () => session;
    Peca.find = () => ({ session: received => { assert.equal(received, session); return [{ _id: partId, codigo: 'DEMO-2', nome: 'Fictícia', preco_venda: 25, estoque_atual: 5 }]; } });
    Peca.updateOne = async (_query, update, options) => { assert.equal(options.session, session); actions.push('stock'); assert.equal(update.$inc.estoque_atual, -2); return { modifiedCount: 1 }; };
    Order.create = async (docs, options) => { assert.equal(options.session, session); actions.push('order'); return [{ _id: orderId, ...docs[0] }]; };
    Movimentacao.create = async (docs, options) => { movementDocs = docs; movementOptions = options; actions.push('movement'); };
    const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    try {
        await OrdersController.checkout({ body: { items: [{ partId: partId.toString(), quantity: 2 }] }, user: { id: actor } }, res);
        assert.equal(res.code, 201);
        assert.deepEqual(actions, ['order', 'stock', 'movement']);
        assert.equal(movementOptions.session, session);
        assert.equal(movementDocs.length, 1);
        assert.equal(movementDocs[0].tipo, 'saida');
        assert.equal(movementDocs[0].quantidade, 2);
        assert.equal(String(movementDocs[0].peca_id), partId.toString());
        assert.equal(movementDocs[0].usuario_id, actor);
        assert.equal(movementDocs[0].motivo, `Pedido ${orderId}`);
    } finally {
        mongoose.startSession = original.startSession;
        Peca.find = original.find;
        Peca.updateOne = original.updateOne;
        Order.create = original.orderCreate;
        Movimentacao.create = original.movementCreate;
    }
});
