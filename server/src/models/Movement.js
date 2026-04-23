const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
    tipo: { type: String, enum: ['entrada', 'saida'], required: true },
    quantidade: { type: Number, required: true },
    motivo: String,
    peca_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Peca', required: true },
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
}, { timestamps: { createdAt: 'criado_em', updatedAt: false } });

module.exports = mongoose.model('Movimentacao', movementSchema);
