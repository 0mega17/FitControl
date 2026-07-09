const Booking = require('../../models/Reserva');
const ClassGroup = require('../../models/ClaseGrupal');
const Client = require('../../models/Cliente');

/**
 * @description Crea una reserva para una clase grupal. Verifica capacidad y duplicados.
 * @route POST /api/bookings
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
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

/**
 * @description Obtiene las reservas del cliente autenticado.
 * @route GET /api/bookings/my
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
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

/**
 * @description Obtiene todas las reservas del sistema (solo admin/entrenadores).
 * @route GET /api/bookings
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
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

/**
 * @description Cancela una reserva por su ID.
 * @route PUT /api/bookings/:id/cancel
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
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
