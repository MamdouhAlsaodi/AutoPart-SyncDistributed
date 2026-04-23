const Peca = require('../models/Part');
const Movimentacao = require('../models/Movement');
const mongoose = require('mongoose');

class PartsController {
    async getAll(req, res) {
        try {
            const { busca, categoria_id, estoque } = req.query;
            let filter = { ativo: true };
            if (busca) filter.$or = [{ nome: new RegExp(busca, 'i') }, { codigo: new RegExp(busca, 'i') }];
            if (categoria_id) filter.categoria_id = categoria_id;

            let parts;
            if (estoque === 'baixo') {
                // Low stock: where estoque_atual <= estoque_minimo
                parts = await Peca.find({ ...filter, $expr: { $lte: ['$estoque_atual', '$estoque_minimo'] } })
                    .populate('categoria_id', 'nome').populate('fornecedor_id', 'nome').sort('nome');
            } else {
                parts = await Peca.find(filter).populate('categoria_id', 'nome').populate('fornecedor_id', 'nome').sort('nome');
            }

            // Format for client
            const data = parts.map(p => ({
                ...p.toObject(),
                categoria: p.categoria_id?.nome || null,
                fornecedor: p.fornecedor_id?.nome || null
            }));
            res.json({ data, count: data.length });
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }

    async getById(req, res) {
        try {
            const part = await Peca.findById(req.params.id).populate('categoria_id').populate('fornecedor_id');
            if (!part) return res.status(404).json({ erro: true, mensagem: 'Peça não encontrada' });
            res.json(part);
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }

    async create(req, res) {
        try {
            const part = await Peca.create(req.body);
            res.status(201).json({ mensagem: 'Peça cadastrada com sucesso', data: part });
        } catch (err) { res.status(400).json({ erro: true, mensagem: err.message }); }
    }
}

module.exports = new PartsController();
