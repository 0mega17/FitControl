const crypto = require('crypto');
const Attendance = require('../../models/Asistencia');
const Client = require('../../models/Cliente');
const Membership = require('../../models/Membresia');

/**
 * @description Genera un token QR para registro de asistencia del cliente autenticado.
 *              Verifica membresía activa antes de generar.
 * @route POST /api/attendance/generate-qr
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const generateQR = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const membresiaActiva = await Membership.findOne({ cliente: cliente._id, estado: 'activa' });
    if (!membresiaActiva) return res.status(403).json({ mensaje: 'Membresía inactiva o vencida' });

    const qrToken = crypto.randomBytes(20).toString('hex');
    const hoy = new Date().toISOString().split('T')[0];

    res.json({ qrToken, qrData: JSON.stringify({ clienteId: cliente._id, qrToken, fecha: hoy }) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar QR', error: error.message });
  }
};

/**
 * @description Registra asistencia del cliente mediante datos QR escaneados.
 * @route POST /api/attendance/qr
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const registerByQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    const { clienteId } = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;

    const now = new Date();
    const asistencia = await Attendance.create({
      cliente: clienteId, fecha: now,
      horaEntrada: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      metodo: 'QR', presente: true
    });
    res.status(201).json(asistencia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar asistencia QR', error: error.message });
  }
};

/**
 * @description Registra asistencia manualmente por ID de cliente (admin/entrenador).
 * @route POST /api/attendance/manual
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const registerManual = async (req, res) => {
  try {
    const { clienteId } = req.body;
    const now = new Date();
    const asistencia = await Attendance.create({
      cliente: clienteId, fecha: now,
      horaEntrada: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      metodo: 'Manual', presente: true
    });
    res.status(201).json(asistencia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar asistencia', error: error.message });
  }
};

/**
 * @description Obtiene las últimas 30 asistencias del cliente autenticado.
 * @route GET /api/attendance/my
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getByClient = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    const asistencias = await Attendance.find({ cliente: cliente._id })
      .sort({ fecha: -1 }).limit(30);
    res.json(asistencias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener asistencias', error: error.message });
  }
};

/**
 * @description Obtiene todas las asistencias con filtro opcional por fecha.
 * @route GET /api/attendance
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getAll = async (req, res) => {
  try {
    const { fecha } = req.query;
    let filter = {};
    if (fecha) {
      const start = new Date(fecha);
      start.setHours(0, 0, 0, 0);
      const end = new Date(fecha);
      end.setHours(23, 59, 59, 999);
      filter.fecha = { $gte: start, $lte: end };
    }
    const asistencias = await Attendance.find(filter)
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido' } })
      .sort({ fecha: -1 });
    res.json(asistencias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener asistencias', error: error.message });
  }
};

module.exports = { generateQR, registerByQR, registerManual, getByClient, getAll };
