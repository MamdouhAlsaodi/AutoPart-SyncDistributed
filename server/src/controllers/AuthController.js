const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getJwtSecret } = require('../config/auth');

class AuthController {
    async registerCustomer(req, res) {
        try {
            const nome = typeof req.body.nome === 'string' ? req.body.nome.trim() : '';
            const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
            const password = typeof req.body.password === 'string' ? req.body.password : '';
            if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) return res.status(400).json({ erro: true, mensagem: 'Dados de cadastro inválidos' });
            if (await User.findOne({ email })) return res.status(400).json({ erro: true, mensagem: 'E-mail já cadastrado' });
            const user = await User.create({ nome, email, senha: await bcrypt.hash(password, 10), perfil: 'cliente', ativo: true });
            return res.status(201).json({ user: { id: user._id, nome: user.nome, email: user.email, perfil: user.perfil } });
        } catch (err) { return res.status(400).json({ erro: true, mensagem: err.message }); }
    }
    async login(req, res) {
        try { const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''; const { password } = req.body; const user = await User.findOne({ email, ativo: true }); if (!user || !(await bcrypt.compare(password, user.senha))) return res.status(401).json({ erro: true, codigo: 401, mensagem: 'Credenciais inválidas' }); const token = jwt.sign({ id: user._id, perfil: user.perfil }, getJwtSecret(), { expiresIn: '8h' }); res.json({ token, user: { id: user._id, nome: user.nome, perfil: user.perfil } }); }
        catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }
    async me(req, res) { try { const user = await User.findById(req.user.id).select('-senha'); if (!user) return res.status(404).json({ erro: true, mensagem: 'Usuário não encontrado' }); res.json(user); } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); } }
}
module.exports = new AuthController();
