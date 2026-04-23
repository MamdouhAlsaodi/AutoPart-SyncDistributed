const Movimentacao = require('../models/Movement');
const Peca = require('../models/Part');
const mongoose = require('mongoose');

class MovementController {
    async recordEntry(req, res) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const { peca_id, quantidade, motivo, usuario_id } = req.body;

            // ACID: Update stock + Log movement in one transaction
            const peca = await Peca.findById(peca_id).session(session);
            if (!peca) throw new Error('Peça não encontrada');

            peca.estoque_atual += quantidade;
            await peca.save({ session });

            await Movimentacao.create([{ tipo: 'entrada', quantidade, motivo, peca_id, usuario_id }], { session });

            await session.commitTransaction();
            res.json({ mensagem: 'Entrada de estoque registrada com sucesso' });
        } catch (err) {
            await session.abortTransaction();
            res.status(422).json({ erro: true, codigo: 422, mensagem: err.message });
        } finally { session.endSession(); }
    }

    async recordExit(req, res) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const { peca_id, quantidade, motivo, usuario_id } = req.body;

            const peca = await Peca.findById(peca_id).session(session);
            if (!peca) throw new Error('Peça não encontrada');
            if (peca.estoque_atual < quantidade) throw new Error('Estoque insuficiente para realizar a saída.');

            peca.estoque_atual -= quantidade;
            await peca.save({ session });

            await Movimentacao.create([{ tipo: 'saida', quantidade, motivo, peca_id, usuario_id }], { session });

            await session.commitTransaction();
            res.json({ mensagem: 'Saída de estoque registrada com sucesso' });
        } catch (err) {
            await session.abortTransaction();
            res.status(422).json({ erro: true, codigo: 422, mensagem: err.message });
        } finally { session.endSession(); }
    }

    async getHistory(req, res) {
        try {
            const pecaId = req.params.peca_id;
            let query = {};
            if (pecaId) query.peca_id = pecaId;
            const history = await Movimentacao.find(query)
                .populate('peca_id', 'nome codigo').populate('usuario_id', 'nome')
                .sort({ criado_em: -1 }).limit(100);
            const data = history.map(m => ({
                ...m.toObject(),
                peca_nome: m.peca_id?.nome || 'N/A',
                usuario_nome: m.usuario_id?.nome || 'N/A'
            }));
            res.json(data);
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }
}

module.exports = new MovementController();
