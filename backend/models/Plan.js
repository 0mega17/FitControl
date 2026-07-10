/**
 * @module Planes
 * @description Esquema de planes de membresía con precio, duración y beneficios.
 */

const mongoose = require('mongoose');

/**
 * @class Plan
 * @memberof module:Planes
 */
const planSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  duracionDias: {
    type: Number,
    required: true,
    min: 1
  },
  beneficios: [{
    type: String,
    trim: true
  }],
  descripcion: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
