const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  clase: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup', required: true },
  fecha: { type: Date, required: true },
  estado: { type: String, enum: ['confirmada', 'cancelada', 'completada'], default: 'confirmada' }
}, { timestamps: true });

bookingSchema.index({ cliente: 1, fecha: -1 });
bookingSchema.index({ clase: 1, fecha: -1 });

/** @description Modelo de reservas de clases grupales por cliente */
module.exports = mongoose.model('Booking', bookingSchema);
