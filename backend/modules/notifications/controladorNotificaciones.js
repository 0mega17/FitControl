const Notification = require('../../models/Notificacion');

/**
 * @description Crea una notificación directa en el sistema.
 * @route POST /api/notifications
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const create = async (req, res) => {
  try {
    const notificacion = await Notification.create(req.body);
    res.status(201).json(notificacion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear notificación', error: error.message });
  }
};

/**
 * @description Obtiene las últimas 50 notificaciones del usuario autenticado.
 * @route GET /api/notifications/my
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getMyNotifications = async (req, res) => {
  try {
    const notis = await Notification.find({ usuario: req.user._id })
      .sort({ fechaEnvio: -1 }).limit(50);
    res.json(notis);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener notificaciones', error: error.message });
  }
};

/**
 * @description Obtiene todas las notificaciones del sistema (admin).
 * @route GET /api/notifications
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getAll = async (req, res) => {
  try {
    const notis = await Notification.find()
      .populate('usuario', 'nombre apellido email')
      .sort({ fechaEnvio: -1 });
    res.json(notis);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener notificaciones', error: error.message });
  }
};

/**
 * @description Marca una notificación como leída por ID.
 * @route PUT /api/notifications/:id/read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const markAsRead = async (req, res) => {
  try {
    const noti = await Notification.findByIdAndUpdate(req.params.id, { leida: true }, { new: true });
    if (!noti) return res.status(404).json({ mensaje: 'Notificación no encontrada' });
    res.json(noti);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al marcar notificación', error: error.message });
  }
};

/**
 * @description Marca todas las notificaciones del usuario como leídas.
 * @route PUT /api/notifications/read-all
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ usuario: req.user._id, leida: false }, { leida: true });
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al marcar notificaciones', error: error.message });
  }
};

/**
 * @description Obtiene el número de notificaciones no leídas del usuario.
 * @route GET /api/notifications/unread-count
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ usuario: req.user._id, leida: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener conteo', error: error.message });
  }
};

/**
 * @description Envía un email de prueba (simulado).
 * @route POST /api/notifications/test-email
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const sendTestEmail = async (req, res) => {
  try {
    const { email, asunto, mensaje } = req.body;
    console.log(`[SIMULACIÓN] Email enviado a ${email}: ${asunto} - ${mensaje}`);
    res.json({ mensaje: 'Email enviado (simulación)', enviado: true });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar email', error: error.message });
  }
};

/**
 * @description Envía un WhatsApp de prueba (simulado).
 * @route POST /api/notifications/test-whatsapp
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const sendTestWhatsApp = async (req, res) => {
  try {
    const { telefono, mensaje } = req.body;
    console.log(`[SIMULACIÓN] WhatsApp enviado a ${telefono}: ${mensaje}`);
    res.json({ mensaje: 'WhatsApp enviado (simulación)', enviado: true });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar WhatsApp', error: error.message });
  }
};

module.exports = { create, getMyNotifications, getAll, markAsRead, markAllAsRead, getUnreadCount, sendTestEmail, sendTestWhatsApp };
