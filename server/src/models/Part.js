const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    descricao: String,
    preco_custo: { type: Number, required: true },
    preco_venda: { type: Number, required: true },
    estoque_atual: { type: Number, default: 0 },
    estoque_minimo: { type: Number, default: 5 },
    categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
    fornecedor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor' },
    ativo: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' } });

module.exports = mongoose.model('Peca', partSchema);
