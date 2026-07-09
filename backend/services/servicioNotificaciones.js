const Notification = require('../models/Notificacion');
const User = require('../models/Usuario');

/**
 * @description Crea una notificación para un usuario, evitando duplicados en 24h.
 * @param {Object} opts
 * @param {string} opts.usuarioId - ObjectId del usuario destino
 * @param {string} opts.asunto - Título de la notificación
 * @param {string} opts.mensaje - Cuerpo de la notificación
 * @param {'info'|'warning'|'urgent'} [opts.severidad='info']
 * @param {'email'|'whatsapp'|'in-app'} [opts.tipo='in-app']
 * @returns {Promise<Object|null>}
 */
const createNotification = async ({ usuarioId, asunto, mensaje, severidad = 'info', tipo = 'in-app' }) => {
  try {
    const exists = await Notification.findOne({
      usuario: usuarioId,
      asunto,
      fechaEnvio: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    if (exists) return exists;

    return await Notification.create({
      usuario: usuarioId, asunto, mensaje,
      severidad, tipo, fechaEnvio: new Date(), enviada: true
    });
  } catch (error) {
    console.error('Error al crear notificacion:', error.message);
    return null;
  }
};

/**
 * @description Notifica a todos los usuarios con un rol específico.
 * @param {Object} opts
 * @param {string} opts.rol - Nombre del rol (Administrador|Entrenador|Cliente)
 * @param {string} opts.asunto
 * @param {string} opts.mensaje
 * @param {'info'|'warning'|'urgent'} [opts.severidad='info']
 * @returns {Promise<void>}
 */
const notifyAllByRole = async ({ rol, asunto, mensaje, severidad = 'info' }) => {
  try {
    const users = await User.find().populate('rol', 'nombre');
    const targetUsers = users.filter(u => u.rol?.nombre === rol);
    for (const user of targetUsers) {
      await createNotification({
        usuarioId: user._id, asunto, mensaje, severidad
      });
    }
  } catch (error) {
    console.error('Error al notificar rol:', error.message);
  }
};

/**
 * @description Notifica a todos los administradores y entrenadores del sistema.
 * @param {Object} opts
 * @param {string} opts.asunto
 * @param {string} opts.mensaje
 * @param {'info'|'warning'|'urgent'} [opts.severidad='info']
 * @returns {Promise<void>}
 */
const notifyAdminsAndTrainers = async ({ asunto, mensaje, severidad = 'info' }) => {
  await notifyAllByRole({ rol: 'Administrador', asunto, mensaje, severidad });
  await notifyAllByRole({ rol: 'Entrenador', asunto, mensaje, severidad });
};

module.exports = { createNotification, notifyAllByRole, notifyAdminsAndTrainers };
