const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    senha: { type: String, required: true },
    perfil: { type: String, enum: ['admin', 'operador', 'consulta', 'cliente'], default: 'consulta' },
    ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criado_em', updatedAt: false } });

module.exports = mongoose.model('Usuario', userSchema);
