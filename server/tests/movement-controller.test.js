const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Peca = require('../src/models/Part');
const Movimentacao = require('../src/models/Movement');
const controller = require('../src/controllers/MovementController');

function response() {
    return { code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test('movement rejects nonpositive or string quantities before accessing MongoDB', async () => {
    const original = mongoose.startSession;
    mongoose.startSession = async () => { throw new Error('Must not open a session for invalid request'); };
    try {
        for (const amount of ['2', 0, -1, 1.5, null]) {
            const res = response();
            const handler = controller.recordEntry; // Express passes the method as an unbound callback
            await handler({ body: { peca_id: new mongoose.Types.ObjectId().toString(), quantidade: amount }, user: { id: 'trusted' } }, res);
            assert.equal(res.code, 422);
            assert.equal(res.body?.erro, true);
        }
    } finally { mongoose.startSession = original; }
});

test('stock movement uses authenticated actor, not an ID supplied in request body', async () => {
    const oldStart = mongoose.startSession, oldFind = Peca.findById, oldCreate = Movimentacao.create;
    const id = new mongoose.Types.ObjectId().toString(), actor = new mongoose.Types.ObjectId().toString();
    const document = { _id: id, ativo: true, estoque_atual: 5, session() { return this; }, async save() {} };
    let captured;
    mongoose.startSession = async () => ({ startTransaction() {}, async commitTransaction() {}, async abortTransaction() {}, async endSession() {} });
    Peca.findById = () => document;
    Movimentacao.create = async docs => { captured = docs[0]; };
    try {
        const res = response();
        await controller.recordEntry({ body: { peca_id: id, quantidade: 2, motivo: 'Reposição demonstrativa', usuario_id: 'spoof' }, user: { id: actor } }, res);
        assert.equal(res.code, 200);
        assert.equal(document.estoque_atual, 7);
        assert.equal(captured.usuario_id, actor);
        assert.equal(captured.quantidade, 2);
    } finally { mongoose.startSession = oldStart; Peca.findById = oldFind; Movimentacao.create = oldCreate; }
});
