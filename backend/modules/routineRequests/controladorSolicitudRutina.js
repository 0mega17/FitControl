<<<<<<< HEAD:backend/modules/routineRequests/routineRequest.controller.js
const RoutineRequest = require('../../models/SolicitudRutina');
const Routine = require('../../models/Rutina');
const AssignedRoutine = require('../../models/RutinaAsignada');
const Client = require('../../models/Cliente');
const { createNotification, notifyAdminsAndTrainers } = require('../../services/servicioNotificaciones');
=======
﻿const RoutineRequest = require('../../models/SolicitudRutina');
const Routine = require('../../models/Rutina');
const AssignedRoutine = require('../../models/RutinaAsignada');
const Client = require('../../models/Cliente');
const { createNotification, notifyAdminsAndTrainers } = require('../../services/notificationService');
>>>>>>> feb2d3cacb88bdb9e6de5d366b67189120f75f6b:backend/modules/routineRequests/controladorSolicitudRutina.js

const crearSolicitud = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });

    const { edad, peso, estatura, experiencia, tiempoEntrenando, diasDisponibles, objetivo, otroObjetivo, metaPersonal } = req.body;
    if (!edad || !peso || !estatura || !experiencia || !tiempoEntrenando || !diasDisponibles || !objetivo || !metaPersonal) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const solicitud = await RoutineRequest.create({
      clienteId: cliente._id, edad, peso, estatura, experiencia,
      tiempoEntrenando, diasDisponibles, objetivo,
      otroObjetivo: objetivo === 'Otro' ? otroObjetivo : undefined,
      metaPersonal
    });

    await createNotification({ usuarioId: req.user._id, asunto: 'Solicitud recibida', mensaje: 'Tu solicitud de rutina personalizada fue enviada correctamente.', severidad: 'info' });
    await notifyAdminsAndTrainers({ asunto: 'Nueva solicitud de rutina', mensaje: `Un cliente ha solicitado una rutina personalizada.`, severidad: 'warning' });

    res.status(201).json(solicitud);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear solicitud', error: error.message });
  }
};

const obtenerMisSolicitudes = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });

    const solicitudes = await RoutineRequest.find({ clienteId: cliente._id })
      .populate('entrenadorId', 'nombre apellido')
      .populate('rutinaAsignada', 'nombre nivel objetivo')
      .sort({ fechaSolicitud: -1 });

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener solicitudes', error: error.message });
  }
};

const obtenerPendientes = async (req, res) => {
  try {
    const solicitudes = await RoutineRequest.find()
      .populate({ path: 'clienteId', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .populate('entrenadorId', 'nombre apellido')
      .populate('rutinaAsignada', 'nombre nivel objetivo')
      .sort({ fechaSolicitud: -1 });

    res.json(solicitudes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener solicitudes', error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const solicitud = await RoutineRequest.findById(req.params.id)
      .populate({ path: 'clienteId', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .populate('entrenadorId', 'nombre apellido')
      .populate('rutinaAsignada', 'nombre nivel objetivo ejercicios');

    if (!solicitud) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });

    const cliente = await Client.findOne({ usuario: req.user._id });
    if (req.user.rol?.nombre === 'Cliente' && (!cliente || solicitud.clienteId._id.toString() !== cliente._id.toString())) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener solicitud', error: error.message });
  }
};

const getClienteUserId = async (clienteId) => {
  try {
    const client = await Client.findById(clienteId);
    return client?.usuario;
  } catch {
    return null;
  }
};

const aprobarSolicitud = async (req, res) => {
  try {
    const solicitud = await RoutineRequest.findByIdAndUpdate(
      req.params.id,
      { estado: 'En revision', entrenadorId: req.user._id, fechaRespuesta: new Date() },
      { new: true }
    );
    if (!solicitud) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    const userId = await getClienteUserId(solicitud.clienteId);
    if (userId) {
      await createNotification({ usuarioId: userId, asunto: 'Solicitud aprobada', mensaje: 'Tu solicitud fue aprobada por un entrenador.', severidad: 'success' });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al aprobar solicitud', error: error.message });
  }
};

const rechazarSolicitud = async (req, res) => {
  try {
    const { motivo } = req.body;
    const solicitud = await RoutineRequest.findByIdAndUpdate(
      req.params.id,
      { estado: 'Rechazada', entrenadorId: req.user._id, fechaRespuesta: new Date(), motivoRechazo: motivo || '' },
      { new: true }
    );
    if (!solicitud) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
    const userId = await getClienteUserId(solicitud.clienteId);
    if (userId) {
      await createNotification({ usuarioId: userId, asunto: 'Solicitud rechazada', mensaje: `Tu solicitud fue rechazada.${motivo ? ' Motivo: ' + motivo : ''}`, severidad: 'urgent' });
    }
    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al rechazar solicitud', error: error.message });
  }
};

const asignarRutina = async (req, res) => {
  try {
    const { rutinaId } = req.body;
    const solicitud = await RoutineRequest.findById(req.params.id);
    if (!solicitud) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });

    const rutina = await Routine.findById(rutinaId);
    if (!rutina) return res.status(404).json({ mensaje: 'Rutina no encontrada' });

    await AssignedRoutine.create({
      rutina: rutinaId,
      cliente: solicitud.clienteId,
      asignadoPor: req.user._id,
      estado: 'activa'
    });

    solicitud.estado = 'Rutina asignada';
    solicitud.rutinaAsignada = rutinaId;
    solicitud.fechaRespuesta = new Date();
    await solicitud.save();

    const userId = await getClienteUserId(solicitud.clienteId);
    if (userId) {
      await createNotification({ usuarioId: userId, asunto: 'Rutina personalizada asignada', mensaje: 'Se ha asignado una nueva rutina personalizada a tu cuenta.', severidad: 'success' });
    }

    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar rutina', error: error.message });
  }
};

module.exports = { crearSolicitud, obtenerMisSolicitudes, obtenerPendientes, obtenerPorId, aprobarSolicitud, rechazarSolicitud, asignarRutina };
