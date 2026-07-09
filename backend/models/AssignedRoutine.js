const mongoose = require('mongoose');

const assignedRoutineSchema = new mongoose.Schema({
  rutina: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine', required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  asignadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  estado: { type: String, enum: ['activa', 'completada', 'cancelada'], default: 'activa' }
}, { timestamps: true });

assignedRoutineSchema.index({ cliente: 1, estado: 1 });

module.exports = mongoose.model('AssignedRoutine', assignedRoutineSchema);
