const MovementModel = require('../models/Movement');

class MovementController {
    async recordEntry(req, res) {
        try {
            const { peca_id, quantidade, motivo, usuario_id } = req.body;
            const result = await MovementModel.recordMovement({
                peca_id, usuario_id, quantidade, tipo: 'entrada', motivo
            });
            res.json({ mensagem: 'Entrada de estoque registrada com sucesso' });
        } catch (err) {
            res.status(422).json({ erro: true, codigo: 422, mensagem: err.message });
        }
    }

    async recordExit(req, res) {
        try {
            const { peca_id, quantidade, motivo, usuario_id } = req.body;
            const result = await MovementModel.recordMovement({
                peca_id, usuario_id, quantidade, tipo: 'saida', motivo
            });
            res.json({ mensagem: 'Saída de estoque registrada com sucesso' });
        } catch (err) {
            res.status(422).json({ erro: true, codigo: 422, mensagem: err.message });
        }
    }

    async getHistory(req, res) {
        try {
            const peca_id = req.params.peca_id;
            const history = await MovementModel.getHistory(peca_id);
            res.json(history);
        } catch (err) {
            res.status(500).json({ erro: true, mensagem: err.message });
        }
    }
}

module.exports = new MovementController();
