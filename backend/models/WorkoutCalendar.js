const mongoose = require('mongoose');

const workoutCalendarSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  entrenador: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  fecha: { type: Date, required: true },
  horaInicio: { type: String, required: true },
  horaFin: { type: String, required: true },
  tipo: { type: String, enum: ['Sesión Personal', 'Clase Grupal', 'Evaluación', 'Libre'], required: true },
  titulo: { type: String, required: true },
  notas: { type: String, trim: true },
  estado: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'completada'], default: 'pendiente' }
}, { timestamps: true });

workoutCalendarSchema.index({ entrenador: 1, fecha: 1 });
workoutCalendarSchema.index({ cliente: 1, fecha: 1 });

module.exports = mongoose.model('WorkoutCalendar', workoutCalendarSchema);
