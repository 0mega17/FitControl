/**
 * @module Membresias
 * @description Esquema de historial de cambios de membresía por cliente.
 */

const mongoose = require('mongoose');

/**
 * @class HistorialMembresia
 * @memberof module:Membresias
 */
const membershipHistorySchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  planAnterior: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  planNuevo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date
  },
  fechaCambio: {
    type: Date,
    default: Date.now
  },
  precio: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['activa', 'completada', 'cancelada'],
    default: 'activa'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MembershipHistory', membershipHistorySchema);
