const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  especialidades: [{
    type: String,
    trim: true
  }],
  telefono: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

/**
 * @module Usuarios
 * @description Modelo de datos extendidos del perfil de entrenador.
 */

/**
 * @class Entrenador
 * @memberof module:Usuarios
 */
module.exports = mongoose.model('Trainer', trainerSchema);
