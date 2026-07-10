/**
 * @module SolicitudesRutinas
 * @description Modelos de datos para solicitudes de rutina personalizada.
 */

const mongoose = require('mongoose');

const routineRequestSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  entrenadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  edad: { type: Number, required: true },
  peso: { type: Number, required: true },
  estatura: { type: Number, required: true },
  experiencia: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado'],
    required: true
  },
  tiempoEntrenando: { type: String, required: true },
  diasDisponibles: { type: Number, required: true },
  objetivo: { type: String, required: true },
  otroObjetivo: { type: String },
  metaPersonal: { type: String, required: true },
  estado: {
    type: String,
    enum: ['Pendiente', 'En revision', 'Rutina asignada', 'Rechazada'],
    default: 'Pendiente'
  },
  fechaSolicitud: { type: Date, default: Date.now },
  fechaRespuesta: { type: Date },
  rutinaAsignada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine'
  },
  motivoRechazo: { type: String }
}, { timestamps: true });

/**
 * @class SolicitudRutina
 * @memberof module:SolicitudesRutinas
 */
module.exports = mongoose.model('RoutineRequest', routineRequestSchema);
