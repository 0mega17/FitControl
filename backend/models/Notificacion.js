const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tipo: { type: String, enum: ['email', 'whatsapp', 'in-app'], default: 'in-app' },
  severidad: { type: String, enum: ['info', 'warning', 'urgent'], default: 'info' },
  asunto: { type: String, required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  fechaEnvio: { type: Date, default: Date.now },
  enviada: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ usuario: 1, leida: 1 });

/**
 * @class Notificacion
 * @memberof module:Notificaciones
 */
module.exports = mongoose.model('Notification', notificationSchema);
