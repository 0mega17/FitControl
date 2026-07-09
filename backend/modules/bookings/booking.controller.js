const Booking = require('../../models/Booking');
const ClassGroup = require('../../models/ClassGroup');
const Client = require('../../models/Client');

const create = async (req, res) => {
  try {
    const { claseId, fecha } = req.body;
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const clase = await ClassGroup.findById(claseId);
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    if (clase.inscritos.length >= clase.capacidad)
      return res.status(400).json({ mensaje: 'Clase llena' });

    const existente = await Booking.findOne({ cliente: cliente._id, clase: claseId, fecha: new Date(fecha), estado: 'confirmada' });
    if (existente) return res.status(400).json({ mensaje: 'Ya tienes una reserva para esta clase' });

    const reserva = await Booking.create({ cliente: cliente._id, clase: claseId, fecha });
    if (!clase.inscritos.includes(cliente._id)) {
      clase.inscritos.push(cliente._id);
      await clase.save();
    }
    res.status(201).json(reserva);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear reserva', error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    const reservas = await Booking.find({ cliente: cliente._id })
      .populate({ path: 'clase', populate: { path: 'entrenador', populate: { path: 'usuario', select: 'nombre apellido' } } })
      .sort({ fecha: -1 });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const reservas = await Booking.find()
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido' } })
      .populate({ path: 'clase' })
      .sort({ fecha: -1 });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas', error: error.message });
  }
};

const cancel = async (req, res) => {
  try {
    const reserva = await Booking.findByIdAndUpdate(req.params.id, { estado: 'cancelada' }, { new: true });
    if (!reserva) return res.status(404).json({ mensaje: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar reserva', error: error.message });
  }
};

module.exports = { create, getMyBookings, getAll, cancel };
