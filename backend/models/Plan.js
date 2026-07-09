const mongoose = require('mongoose');

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
