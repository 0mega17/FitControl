const mongoose = require('mongoose');

const ejercicioRutinaSchema = new mongoose.Schema({
  idExerciseDB: { type: String, required: true },
  nombre: { type: String, required: true },
  gifUrl: { type: String },
  series: { type: Number, required: true, min: 1 },
  repeticiones: { type: Number, required: true, min: 1 },
  descanso: { type: Number, default: 60 },
  observaciones: { type: String, trim: true },
  orden: { type: Number, required: true }
});

const routineSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  nivel: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado'],
    required: true
  },
  objetivo: {
    type: String,
    enum: ['hipertrofia', 'fuerza', 'resistencia', 'definicion'],
    required: true
  },
  grupoMuscularPrincipal: { type: String, required: true },
  grupoMuscularSecundario: { type: String },
  ejercicios: [ejercicioRutinaSchema],
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  esPlantilla: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Routine', routineSchema);
