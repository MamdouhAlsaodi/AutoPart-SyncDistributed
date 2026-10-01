const Movimentacao = require('../models/Movement');
const Peca = require('../models/Part');
const mongoose = require('mongoose');

function movementFields(req) {
    const { peca_id, quantidade, motivo } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(peca_id) || !Number.isSafeInteger(quantidade) || quantidade <= 0 ||
        (motivo !== undefined && (typeof motivo !== 'string' || motivo.length > 200))) {
        throw new Error('Peça, quantidade inteira positiva e motivo válido são obrigatórios');
    }
    return { peca_id, quantidade, motivo: motivo?.trim() || 'Ajuste manual de estoque', usuario_id: req.user.id };
}

class MovementController {
    async record(req, res, tipo) {
        let fields;
        try { fields = movementFields(req); }
        catch (error) { return res.status(422).json({ erro: true, codigo: 422, mensagem: error.message }); }
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const peca = await Peca.findById(fields.peca_id).session(session);
            if (!peca || !peca.ativo) throw new Error('Peça não encontrada ou inativa');
            if (tipo === 'saida' && peca.estoque_atual < fields.quantidade) throw new Error('Estoque insuficiente para realizar a saída.');
            peca.estoque_atual += tipo === 'entrada' ? fields.quantidade : -fields.quantidade;
            await peca.save({ session });
            await Movimentacao.create([{ tipo, ...fields }], { session });
            await session.commitTransaction();
            return res.json({ mensagem: tipo === 'entrada' ? 'Entrada de estoque registrada com sucesso' : 'Saída de estoque registrada com sucesso' });
        } catch (error) {
            await session.abortTransaction();
            return res.status(422).json({ erro: true, codigo: 422, mensagem: error.message });
        } finally { await session.endSession(); }
    }

    async recordEntry(req, res) { return MovementController.prototype.record(req, res, 'entrada'); }
    async recordExit(req, res) { return MovementController.prototype.record(req, res, 'saida'); }

    async getHistory(req, res) {
        try {
            const pecaId = req.params.peca_id;
            if (pecaId && !mongoose.Types.ObjectId.isValid(pecaId)) return res.status(422).json({ erro: true, mensagem: 'Peça inválida' });
            const history = await Movimentacao.find(pecaId ? { peca_id: pecaId } : {})
                .populate('peca_id', 'nome codigo').populate('usuario_id', 'nome')
                .sort({ criado_em: -1 }).limit(100);
            const data = history.map(m => ({
                ...m.toObject(),
                peca_nome: m.peca_id?.nome || 'N/A',
                usuario_nome: m.usuario_id?.nome || 'N/A'
            }));
            return res.json(data);
        } catch (error) { return res.status(500).json({ erro: true, mensagem: error.message }); }
    }
}

module.exports = new MovementController();
