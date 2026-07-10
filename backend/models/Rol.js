const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    enum: ['Administrador', 'Entrenador', 'Cliente']
  }
}, {
  timestamps: true
});

/** @description Modelo de roles del sistema (Administrador, Entrenador, Cliente) */
module.exports = mongoose.model('Role', roleSchema);
