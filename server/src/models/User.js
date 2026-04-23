const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    perfil: { type: String, enum: ['admin', 'operador', 'consulta'], default: 'consulta' },
    ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criado_em', updatedAt: false } });

module.exports = mongoose.model('Usuario', userSchema);
