const WorkoutCalendar = require('../../models/CalendarioEntrenamiento');
const Trainer = require('../../models/Entrenador');
const Client = require('../../models/Cliente');

const create = async (req, res) => {
  try {
    const entrenador = await Trainer.findOne({ usuario: req.user._id });
    if (!entrenador) return res.status(403).json({ mensaje: 'Solo entrenadores pueden crear eventos' });
    const evento = await WorkoutCalendar.create({ ...req.body, entrenador: entrenador._id });
    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear evento', error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const { mes, año, entrenadorId } = req.query;
    let filter = {};
    if (mes && año) {
      const start = new Date(año, mes - 1, 1);
      const end = new Date(año, mes, 0, 23, 59, 59);
      filter.fecha = { $gte: start, $lte: end };
    }
    if (entrenadorId) filter.entrenador = entrenadorId;

    const entrenador = await Trainer.findOne({ usuario: req.user._id });
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (entrenador) filter.entrenador = entrenador._id;
    if (cliente) filter.cliente = cliente._id;

    const eventos = await WorkoutCalendar.find(filter)
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido' } })
      .populate({ path: 'entrenador', populate: { path: 'usuario', select: 'nombre apellido' } })
      .sort({ fecha: 1, horaInicio: 1 });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener eventos', error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const evento = await WorkoutCalendar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!evento) return res.status(404).json({ mensaje: 'Evento no encontrado' });
    res.json(evento);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar evento', error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await WorkoutCalendar.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Evento eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar evento', error: error.message });
  }
};

module.exports = { create, getAll, update, remove };
