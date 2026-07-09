const Notification = require('../../models/Notificacion');

const create = async (req, res) => {
  try {
    const notificacion = await Notification.create(req.body);
    res.status(201).json(notificacion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear notificación', error: error.message });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const notis = await Notification.find({ usuario: req.user._id })
      .sort({ fechaEnvio: -1 }).limit(50);
    res.json(notis);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener notificaciones', error: error.message });
  }
};

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

const markAsRead = async (req, res) => {
  try {
    const noti = await Notification.findByIdAndUpdate(req.params.id, { leida: true }, { new: true });
    if (!noti) return res.status(404).json({ mensaje: 'Notificación no encontrada' });
    res.json(noti);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al marcar notificación', error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ usuario: req.user._id, leida: false }, { leida: true });
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al marcar notificaciones', error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ usuario: req.user._id, leida: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener conteo', error: error.message });
  }
};

const sendTestEmail = async (req, res) => {
  try {
    const { email, asunto, mensaje } = req.body;
    res.json({ mensaje: 'Email enviado (simulación)', enviado: true });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar email', error: error.message });
  }
};

const sendTestWhatsApp = async (req, res) => {
  try {
    const { telefono, mensaje } = req.body;
    res.json({ mensaje: 'WhatsApp enviado (simulación)', enviado: true });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al enviar WhatsApp', error: error.message });
  }
};

module.exports = { create, getMyNotifications, getAll, markAsRead, markAllAsRead, getUnreadCount, sendTestEmail, sendTestWhatsApp };
