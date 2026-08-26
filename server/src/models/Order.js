const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Peca', required: true, immutable: true },
    partCode: { type: String, required: true, trim: true, immutable: true },
    partName: { type: String, required: true, trim: true, immutable: true },
    unitPrice: { type: Number, required: true, min: 0, immutable: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger, immutable: true }
}, { _id: false });
const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    items: { type: [itemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pendente', 'confirmado', 'em_processamento', 'enviado', 'concluido', 'cancelado'], default: 'pendente' }
}, { timestamps: { createdAt: 'criado_em', updatedAt: false } });
module.exports = mongoose.model('Order', orderSchema);
