const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_auto_parts_2026';

class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email, ativo: true });
            if (!user || !(await bcrypt.compare(password, user.senha))) {
                return res.status(401).json({ erro: true, codigo: 401, mensagem: 'Credenciais inválidas' });
            }
            const token = jwt.sign({ id: user._id, perfil: user.perfil }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ token, user: { id: user._id, nome: user.nome, perfil: user.perfil } });
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }

    async me(req, res) {
        try {
            const user = await User.findById(req.user.id).select('-senha');
            if (!user) return res.status(404).json({ erro: true, mensagem: 'Usuário não encontrado' });
            res.json(user);
        } catch (err) { res.status(500).json({ erro: true, mensagem: err.message }); }
    }
}

module.exports = new AuthController();
