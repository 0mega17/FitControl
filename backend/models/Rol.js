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

module.exports = mongoose.model('Role', roleSchema);
