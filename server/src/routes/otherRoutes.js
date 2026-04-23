const express = require('express');
const router = express.Router();
const Categoria = require('../models/Category');
const Fornecedor = require('../models/Supplier');
const { authMiddleware, permissionMiddleware } = require('../middleware/auth');

// Categories
router.get('/categorias', authMiddleware, async (req, res) => {
    try { const cats = await Categoria.find().sort('nome'); res.json(cats); }
    catch(e) { res.status(500).json({ erro: true, mensagem: e.message }); }
});

router.post('/categorias', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try { const cat = await Categoria.create(req.body); res.status(201).json({ mensagem: 'Categoria criada', data: cat }); }
    catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

router.put('/categorias/:id', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try { const cat = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(cat); }
    catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

// Suppliers
router.get('/fornecedores', authMiddleware, async (req, res) => {
    try { const sups = await Fornecedor.find({ ativo: true }).sort('nome'); res.json(sups); }
    catch(e) { res.status(500).json({ erro: true, mensagem: e.message }); }
});

router.post('/fornecedores', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try { const sup = await Fornecedor.create(req.body); res.status(201).json({ mensagem: 'Fornecedor criado', data: sup }); }
    catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

router.put('/fornecedores/:id', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try { const sup = await Fornecedor.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(sup); }
    catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

router.delete('/fornecedores/:id', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try { await Fornecedor.findByIdAndUpdate(req.params.id, { ativo: false }); res.json({ mensagem: 'Fornecedor desativado' }); }
    catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

module.exports = router;
