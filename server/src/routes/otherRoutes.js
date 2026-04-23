const express = require('express');
const router = express.Router();
const { connect, sql } = require('../config/db');
const { authMiddleware, permissionMiddleware } = require('../middleware/auth');

// Categories
router.get('/categorias', authMiddleware, async (req, res) => {
    try {
        const pool = await connect();
        const result = await pool.request().query('SELECT * FROM categorias ORDER BY nome');
        res.json(result.recordset);
    } catch(e) { res.status(500).json({ erro: true, mensagem: e.message }); }
});

router.post('/categorias', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try {
        const { nome, descricao } = req.body;
        const pool = await connect();
        await pool.request().input('nome', sql.VarChar, nome).input('descricao', sql.VarChar, descricao || null)
            .query('INSERT INTO categorias (nome, descricao) VALUES (@nome, @descricao)');
        res.status(201).json({ mensagem: 'Categoria criada com sucesso' });
    } catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

// Suppliers
router.get('/fornecedores', authMiddleware, async (req, res) => {
    try {
        const pool = await connect();
        const result = await pool.request().query('SELECT * FROM fornecedores WHERE ativo = 1 ORDER BY nome');
        res.json(result.recordset);
    } catch(e) { res.status(500).json({ erro: true, mensagem: e.message }); }
});

router.post('/fornecedores', authMiddleware, permissionMiddleware(['admin']), async (req, res) => {
    try {
        const { nome, cnpj, telefone, email } = req.body;
        const pool = await connect();
        await pool.request().input('nome', sql.VarChar, nome).input('cnpj', sql.VarChar, cnpj || null)
            .input('telefone', sql.VarChar, telefone || null).input('email', sql.VarChar, email || null)
            .query('INSERT INTO fornecedores (nome, cnpj, telefone, email) VALUES (@nome, @cnpj, @telefone, @email)');
        res.status(201).json({ mensagem: 'Fornecedor criado com sucesso' });
    } catch(e) { res.status(400).json({ erro: true, mensagem: e.message }); }
});

module.exports = router;
