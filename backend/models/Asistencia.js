/**
 * @module Asistencia
 * @description Modelos de datos para registros de asistencia.
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  fecha: { type: Date, default: Date.now },
  horaEntrada: { type: String },
  horaSalida: { type: String },
  metodo: { type: String, enum: ['QR', 'Manual'], default: 'Manual' },
  qrToken: { type: String },
  presente: { type: Boolean, default: true }
}, { timestamps: true });

attendanceSchema.index({ cliente: 1, fecha: -1 });

/**
 * @class Asistencia
 * @memberof module:Asistencia
 */
module.exports = mongoose.model('Attendance', attendanceSchema);
