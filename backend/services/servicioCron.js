const Notification = require('../models/Notificacion');
const User = require('../models/Usuario');
const Membership = require('../models/Membresia');
const RoutineRequest = require('../models/SolicitudRutina');
const Client = require('../models/Cliente');
const { createNotification, notifyAdminsAndTrainers } = require('./servicioNotificaciones');

const getClienteUserId = async (clienteId) => {
  try {
    const client = await Client.findById(clienteId);
    return client?.usuario;
  } catch { return null; }
};

const checkMembershipExpirations = async () => {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in1Day = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const memberships = await Membership.find({ estado: 'activa' });

    for (const m of memberships) {
      const userId = await getClienteUserId(m.cliente);
      if (!userId) continue;

      const daysUntilExpiry = Math.ceil((m.fechaVencimiento - now) / (1000 * 60 * 60 * 24));

      // 7 days
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 3) {
        const exists = await Notification.findOne({
          usuario: userId, asunto: 'Membresia proxima a vencer',
          fechaEnvio: { $gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }
        });
        if (!exists) {
          await createNotification({ usuarioId: userId, asunto: 'Membresia proxima a vencer', mensaje: 'Tu membresia vence en 7 dias. Renueva para continuar utilizando los servicios.', severidad: 'warning' });
        }
      }

      // 3 days
      if (daysUntilExpiry <= 3 && daysUntilExpiry > 1) {
        const exists = await Notification.findOne({
          usuario: userId, asunto: 'Membresia proxima a vencer',
          fechaEnvio: { $gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) }
        });
        if (!exists) {
          await createNotification({ usuarioId: userId, asunto: 'Membresia proxima a vencer', mensaje: 'Tu membresia vence en 3 dias. Renueva para continuar utilizando los servicios.', severidad: 'urgent' });
        }
      }

      // 1 day
      if (daysUntilExpiry <= 1 && daysUntilExpiry > 0) {
        const exists = await Notification.findOne({
          usuario: userId, asunto: 'Membresia proxima a vencer',
          fechaEnvio: { $gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) }
        });
        if (!exists) {
          await createNotification({ usuarioId: userId, asunto: 'Membresia proxima a vencer', mensaje: 'Tu membresia vence manana. Renueva para continuar utilizando los servicios.', severidad: 'urgent' });
        }
      }
    }
  } catch (error) {
  }
};

const checkExpiredMemberships = async () => {
  try {
    const expired = await Membership.find({ estado: 'vencida' });

    for (const m of expired) {
      const userId = await getClienteUserId(m.cliente);
      if (!userId) continue;

      const exists = await Notification.findOne({
        usuario: userId, asunto: 'Membresia vencida',
        fechaEnvio: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      if (!exists) {
        await createNotification({ usuarioId: userId, asunto: 'Membresia vencida', mensaje: 'Tu membresia ha vencido. Renueva para continuar utilizando los servicios.', severidad: 'urgent' });
      }
    }

    if (expired.length > 0) {
      const adminExists = await Notification.findOne({
        asunto: 'Membresias vencidas',
        fechaEnvio: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });
      if (!adminExists) {
        await notifyAdminsAndTrainers({ asunto: 'Membresias vencidas', mensaje: `Existen ${expired.length} membresia(s) vencida(s) en el sistema.`, severidad: 'urgent' });
      }
    }
  } catch (error) {
  }
};

const checkStaleRequests = async () => {
  try {
    const stale = await RoutineRequest.find({ estado: 'Pendiente' });
    const now = new Date();

    for (const r of stale) {
      const daysStale = Math.floor((now - new Date(r.fechaSolicitud)) / (1000 * 60 * 60 * 24));
      if (daysStale >= 3) {
        const exists = await Notification.findOne({
          asunto: 'Solicitud pendiente por revisar',
          fechaEnvio: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        if (!exists) {
          await notifyAdminsAndTrainers({ asunto: 'Solicitud pendiente por revisar', mensaje: `Existe una solicitud pendiente desde hace ${daysStale} dias.`, severidad: 'urgent' });
        }
      }
    }
  } catch (error) {
  }
};

const startScheduledChecks = () => {
  console.log('Servicio de notificaciones programadas iniciado');

  const runAll = async () => {
    await checkMembershipExpirations();
    await checkExpiredMemberships();
    await checkStaleRequests();
  };

  runAll();
  setInterval(runAll, 60 * 60 * 1000); // every hour
};

module.exports = { startScheduledChecks, checkMembershipExpirations, checkExpiredMemberships, checkStaleRequests };
