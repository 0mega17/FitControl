const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  fecha: { type: Date, default: Date.now },
  peso: { type: Number },
  altura: { type: Number },
  porcentajeGrasa: { type: Number },
  medidas: {
    brazo: { type: Number },
    pierna: { type: Number },
    cintura: { type: Number },
    pecho: { type: Number }
  },
  observaciones: { type: String, trim: true },
  registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

/** @description Modelo de seguimiento de progreso físico con medidas y observaciones */
module.exports = mongoose.model('Progress', progressSchema);
