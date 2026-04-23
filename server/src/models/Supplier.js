const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cnpj: { type: String, unique: true, sparse: true },
    telefone: String,
    email: String,
    ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criado_em', updatedAt: false } });

module.exports = mongoose.model('Fornecedor', supplierSchema);
