const mongoose = require('mongoose');

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

/** @description Modelo de historial de cambios de membresía por cliente */
module.exports = mongoose.model('MembershipHistory', membershipHistorySchema);
