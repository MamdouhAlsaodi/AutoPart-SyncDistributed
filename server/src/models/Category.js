const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    nome: { type: String, required: true },
    descricao: String
}, { timestamps: { createdAt: 'criado_em', updatedAt: false } });

module.exports = mongoose.model('Categoria', categorySchema);
