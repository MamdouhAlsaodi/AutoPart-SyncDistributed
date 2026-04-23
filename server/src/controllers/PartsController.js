const PartsModel = require('../models/Parts');

class PartsController {
    async getAll(req, res) {
        try {
            const filters = {
                busca: req.query.busca,
                categoria_id: req.query.categoria_id,
                estoque: req.query.estoque
            };
            const parts = await PartsModel.getAll(filters);
            res.json({ 
                data: parts, 
                count: parts.length,
                meta: { 
                    filters: filters,
                    timestamp: new Date().toISOString()
                } 
            });
        } catch (err) {
            res.status(500).json({ erro: true, mensagem: err.message });
        }
    }

    async getById(req, res) {
        try {
            const part = await PartsModel.getById(req.params.id);
            if (!part) return res.status(404).json({ erro: true, mensagem: 'Peça não encontrada' });
            res.json(part);
        } catch (err) {
            res.status(500).json({ erro: true, mensagem: err.message });
        }
    }

    async create(req, res) {
        try {
            const part = await PartsModel.create(req.body);
            res.status(201).json({ mensagem: 'Peça cadastrada com sucesso', data: part });
        } catch (err) {
            res.status(400).json({ erro: true, mensagem: err.message });
        }
    }
}

module.exports = new PartsController();
