/**
 * @module Estadisticas
 * @description Esquema de configuración global del sistema clave-valor.
 */

const mongoose = require('mongoose');

/**
 * @class Configuracion
 * @memberof module:Estadisticas
 */
const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
