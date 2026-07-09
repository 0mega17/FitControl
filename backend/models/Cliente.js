const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  telefono: {
    type: String,
    trim: true
  },
  fechaNacimiento: {
    type: Date
  },
  direccion: {
    type: String,
    trim: true
  },
  objetivo: {
    type: String
  },
  edad: {
    type: Number
  },
  estatura: {
    type: Number
  },
  peso: {
    type: Number
  },
  experiencia: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
