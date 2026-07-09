const Notification = require('../models/Notification');
const User = require('../models/User');

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

const notifyAdminsAndTrainers = async ({ asunto, mensaje, severidad = 'info' }) => {
  await notifyAllByRole({ rol: 'Administrador', asunto, mensaje, severidad });
  await notifyAllByRole({ rol: 'Entrenador', asunto, mensaje, severidad });
};

module.exports = { createNotification, notifyAllByRole, notifyAdminsAndTrainers };
