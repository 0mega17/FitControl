const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true,
    default: Date.now
  },
  fechaVencimiento: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['activa', 'vencida', 'cancelada'],
    default: 'activa'
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  beneficios: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

membershipSchema.methods.verificarEstado = function () {
  if (this.fechaVencimiento < new Date() && this.estado === 'activa') {
    this.estado = 'vencida';
    return this.save();
  }
};

module.exports = mongoose.model('Membership', membershipSchema);
