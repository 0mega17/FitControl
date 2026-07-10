const mongoose = require('mongoose');

const classGroupSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, trim: true },
  entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  diaSemana: { type: String, enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'], required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  capacidad: { type: Number, required: true, min: 1 },
  inscritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Client' }],
  activa: { type: Boolean, default: true }
}, { timestamps: true });

/**
 * @module Calendario
 * @description Modelo de clases grupales con capacidad, horario y control de inscritos.
 */

/**
 * @class ClaseGrupal
 * @memberof module:Calendario
 */
classGroupSchema.virtual('cuposDisponibles').get(function () {
  return this.capacidad - (this.inscritos?.length || 0);
});

classGroupSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ClassGroup', classGroupSchema);
