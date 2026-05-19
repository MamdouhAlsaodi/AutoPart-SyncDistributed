const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserController {
    async list(req, res) {
        try {
            const users = await User.find().select('-senha').sort({ criado_em: -1 });
            res.json(users);
        } catch (err) {
            res.status(500).json({ erro: true, mensagem: err.message });
        }
    }

    async create(req, res) {
        try {
            const { nome, email, password, perfil } = req.body;

            // Validation
            if (!nome || !nome.trim()) return res.status(400).json({ erro: true, mensagem: 'Nome é obrigatório' });
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ erro: true, mensagem: 'E-mail inválido' });
            if (!password || password.length < 6) return res.status(400).json({ erro: true, mensagem: 'Senha deve ter no mínimo 6 caracteres' });
            if (!['admin', 'operador', 'consulta'].includes(perfil)) return res.status(400).json({ erro: true, mensagem: 'Perfil inválido. Use: admin, operador ou consulta' });

            const existing = await User.findOne({ email: email.toLowerCase().trim() });
            if (existing) {
                return res.status(400).json({ erro: true, mensagem: 'Este e-mail já está em uso' });
            }

            const hashedSenha = await bcrypt.hash(password, 10);
            const user = await User.create({
                nome: nome.trim(),
                email: email.toLowerCase().trim(),
                senha: hashedSenha,
                perfil,
                ativo: true
            });

            res.status(201).json({ id: user._id, nome: user.nome, email: user.email, perfil: user.perfil });
        } catch (err) {
            res.status(400).json({ erro: true, mensagem: err.message });
        }
    }

    async toggleStatus(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ erro: true, mensagem: 'Usuário não encontrado' });
            
            user.ativo = !user.ativo;
            await user.save();
            
            res.json({ mensagem: `Usuário ${user.ativo ? 'ativado' : 'desativado'} com sucesso`, ativo: user.ativo });
        } catch (err) {
            res.status(500).json({ erro: true, mensagem: err.message });
        }
    }
}

module.exports = new UserController();
