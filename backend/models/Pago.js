/**
 * @module Pagos
 * @description Esquema de pagos asociados a membresías y clientes.
 */

const mongoose = require('mongoose');

/**
 * @class Pago
 * @memberof module:Pagos
 */
const paymentSchema = new mongoose.Schema({
  valor: {
    type: Number,
    required: true
  },
  fechaPago: {
    type: Date,
    required: true,
    default: Date.now
  },
  metodoPago: {
    type: String,
    required: true,
    enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Registro', 'Otro']
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  membresia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
