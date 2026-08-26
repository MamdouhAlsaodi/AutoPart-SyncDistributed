const mongoose = require('mongoose');

const compatibilitySchema = new mongoose.Schema({
    marca: { type: String, required: true, trim: true, minlength: 1 },
    modelo: { type: String, required: true, trim: true, minlength: 1 },
    anos: {
        type: [{ type: Number, required: true, min: 1886, max: 2100, validate: Number.isInteger }],
        required: true,
        validate: value => Array.isArray(value) && value.length > 0
    }
}, { _id: false });

const partSchema = new mongoose.Schema({
    codigo: { type: String, required: true, unique: true }, nome: { type: String, required: true }, descricao: String,
    preco_custo: { type: Number, required: true }, preco_venda: { type: Number, required: true }, estoque_atual: { type: Number, default: 0, min: 0, validate: Number.isInteger }, estoque_minimo: { type: Number, default: 5 },
    categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }, fornecedor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Fornecedor' }, ativo: { type: Boolean, default: true },
    compatibilidades: { type: [compatibilitySchema], required: true, default: [{ marca: 'Universal', modelo: 'Aplicação geral', anos: [2020] }] },
    imagem_referencia: { type: String, trim: true, default: 'https://example.invalid/part-reference.jpg' }
}, { timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' } });

module.exports = mongoose.model('Peca', partSchema);
