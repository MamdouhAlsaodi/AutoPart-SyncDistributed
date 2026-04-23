const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { connect, sql } = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_auto_parts_2026';

class AuthController {
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const pool = await connect();
            const result = await pool.request().input('email', sql.VarChar, email).query('SELECT * FROM usuarios WHERE email = @email AND ativo = 1');
            const user = result.recordset[0];
            if (!user || !(await bcrypt.compare(password, user.senha))) {
                return res.status(401).json({ erro: true, codigo: 401, mensagem: 'Credenciais inválidas' });
            }
            const token = jwt.sign({ id: user.id, perfil: user.perfil }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ token, user: { id: user.id, nome: user.nome, perfil: user.perfil } });
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }

    async me(req, res) {
        try {
            const pool = await connect();
            const result = await pool.request().input('id', sql.Int, req.user.id).query('SELECT id, nome, email, perfil FROM usuarios WHERE id = @id');
            res.json(result.recordset[0]);
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }
}

module.exports = new AuthController();
