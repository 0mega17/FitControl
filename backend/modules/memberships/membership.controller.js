const Membership = require('../../models/Membresia');
const MembershipHistory = require('../../models/HistorialMembresia');
const Client = require('../../models/Cliente');
const User = require('../../models/Usuario');
const Payment = require('../../models/Pago');
const Plan = require('../../models/Plan');
const Settings = require('../../models/Configuracion');
const { createNotification, notifyAllByRole } = require('../../services/servicioNotificaciones');

const calcularVencimiento = (tipo) => {
  const ahora = new Date();
  switch (tipo) {
    case 'Diaria':
      return new Date(ahora.setDate(ahora.getDate() + 1));
    case 'Semanal':
      return new Date(ahora.setDate(ahora.getDate() + 7));
    case 'Mensual':
      return new Date(ahora.setMonth(ahora.getMonth() + 1));
    case 'Trimestral':
      return new Date(ahora.setMonth(ahora.getMonth() + 3));
    case 'Anual':
      return new Date(ahora.setFullYear(ahora.getFullYear() + 1));
    default:
      return new Date(ahora.setDate(ahora.getDate() + 1));
  }
};

const PRECIOS_DEFAULTS = {
  Diaria: 10,
  Semanal: 50,
  Mensual: 150,
  Trimestral: 400,
  Anual: 1200
};

const obtenerPrecios = async () => {
  try {
    const config = await Settings.findOne({ key: 'membershipPrices' });
    return config?.value || PRECIOS_DEFAULTS;
  } catch {
    return PRECIOS_DEFAULTS;
  }
};

const createMembership = async (req, res) => {
  try {
    const { tipo, clienteEmail, metodoPago } = req.body;

    const usuario = await User.findOne({ email: clienteEmail });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado con ese email' });
    }

    const cliente = await Client.findOne({ usuario: usuario._id });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'El usuario no es un cliente registrado' });
    }

    const activaExistente = await Membership.findOne({ cliente: cliente._id, estado: 'activa' });
    if (activaExistente) {
      return res.status(400).json({ mensaje: 'El cliente ya tiene una membresia activa' });
    }

    const PRECIOS = await obtenerPrecios();
    const fechaVencimiento = calcularVencimiento(tipo);
    const precio = PRECIOS[tipo];

    const membresia = await Membership.create({
      tipo,
      fechaInicio: new Date(),
      fechaVencimiento,
      cliente: cliente._id,
      precio
    });

    await Payment.create({
      valor: precio,
      metodoPago: metodoPago || 'Efectivo',
      cliente: cliente._id,
      membresia: membresia._id
    });

    await createNotification({ usuarioId: usuario._id, asunto: 'Pago registrado', mensaje: 'Tu pago fue registrado correctamente.', severidad: 'info' });
    await notifyAllByRole({ rol: 'Administrador', asunto: 'Nuevo pago', mensaje: `Se registro un nuevo pago de ${usuario.nombre} ${usuario.apellido} por $${precio}.`, severidad: 'info' });

    res.status(201).json(membresia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear membresía', error: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const membresias = await Membership.find()
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .sort({ createdAt: -1 });
    res.json(membresias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener membresías', error: error.message });
  }
};

const getActive = async (req, res) => {
  try {
    const membresias = await Membership.find({ estado: 'activa' })
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .sort({ fechaVencimiento: 1 });
    res.json(membresias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener membresías activas', error: error.message });
  }
};

const getExpired = async (req, res) => {
  try {
    const membresias = await Membership.find({ estado: 'vencida' })
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .sort({ fechaVencimiento: -1 });
    res.json(membresias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener membresías vencidas', error: error.message });
  }
};

const getSemaforo = async (req, res) => {
  try {
    await Membership.updateMany(
      { fechaVencimiento: { $lt: new Date() }, estado: 'activa' },
      { estado: 'vencida' }
    );
    const ahora = new Date();
    const dentro7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

    const membresias = await Membership.find()
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido email' } })
      .sort({ fechaVencimiento: 1 });

    const resultado = membresias.map(m => {
      let color;
      if (m.estado === 'vencida') color = 'rojo';
      else if (m.estado === 'activa' && m.fechaVencimiento <= dentro7Dias) color = 'amarillo';
      else if (m.estado === 'activa') color = 'verde';
      else color = 'gris';

      return { ...m.toObject(), semaforo: color };
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener semáforo', error: error.message });
  }
};

const PLAN_MAP = {
  Diaria: 'Basico',
  Semanal: 'Estandar',
  Mensual: 'Estandar',
  Trimestral: 'Premium',
  Anual: 'Premium'
};

const getMyPlan = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) {
      return res.json({ plan: 'Basico', tipo: null });
    }

    const activa = await Membership.findOne({ cliente: cliente._id, estado: 'activa' })
      .sort({ fechaVencimiento: -1 });

    if (!activa) {
      return res.json({ plan: 'Basico', tipo: null });
    }

    const plan = PLAN_MAP[activa.tipo] || 'Basico';
    res.json({ plan, tipo: activa.tipo, vencimiento: activa.fechaVencimiento, membershipId: activa._id });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener plan', error: error.message });
  }
};

const getMyMemberships = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });

    const membresias = await Membership.find({ cliente: cliente._id })
      .sort({ fechaInicio: -1 });

    const membresiaIds = membresias.map(m => m._id);
    const pagos = await Payment.find({ membresia: { $in: membresiaIds } })
      .sort({ fechaPago: -1 });

    res.json({ membresias, pagos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener membresias', error: error.message });
  }
};

const getPrices = async (req, res) => {
  try {
    const precios = await obtenerPrecios();
    res.json(precios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener precios', error: error.message });
  }
};

const updatePrices = async (req, res) => {
  try {
    const precios = req.body;
    const tiposValidos = ['Diaria', 'Semanal', 'Mensual', 'Trimestral', 'Anual'];
    for (const tipo of Object.keys(precios)) {
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ mensaje: `Tipo invalido: ${tipo}` });
      }
      if (typeof precios[tipo] !== 'number' || precios[tipo] <= 0) {
        return res.status(400).json({ mensaje: `Precio invalido para ${tipo}: debe ser un numero positivo` });
      }
    }

    let config = await Settings.findOne({ key: 'membershipPrices' });
    if (config) {
      config.value = { ...config.value, ...precios };
    } else {
      config = new Settings({ key: 'membershipPrices', value: precios });
    }
    await config.save();

    res.json({ mensaje: 'Precios actualizados', precios: config.value });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar precios', error: error.message });
  }
};

const updateMembership = async (req, res) => {
  try {
    const { tipo, precio, estado } = req.body;
    const membresia = await Membership.findById(req.params.id);
    if (!membresia) return res.status(404).json({ mensaje: 'Membresia no encontrada' });

    if (tipo !== undefined) {
      membresia.tipo = tipo;
      membresia.precio = PRECIOS[tipo] || membresia.precio;
    }
    if (precio !== undefined) membresia.precio = precio;
    if (estado !== undefined) membresia.estado = estado;
    await membresia.save();

    res.json(membresia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar membresia', error: error.message });
  }
};

const renewMembership = async (req, res) => {
  try {
    const membresia = await Membership.findById(req.params.id);
    if (!membresia) return res.status(404).json({ mensaje: 'Membresia no encontrada' });

    const fechaVencimiento = calcularVencimiento(membresia.tipo);
    membresia.fechaInicio = new Date();
    membresia.fechaVencimiento = fechaVencimiento;
    membresia.estado = 'activa';
    await membresia.save();

    await Payment.create({
      valor: membresia.precio,
      metodoPago: req.body.metodoPago || 'Efectivo',
      cliente: membresia.cliente,
      membresia: membresia._id
    });

    const cliente = await Client.findById(membresia.cliente).populate('usuario', 'nombre apellido');
    const nombreCliente = cliente?.usuario?.nombre || 'Cliente';
    await notifyAllByRole({ rol: 'Administrador', asunto: 'Membresia renovada', mensaje: `Se renovo la membresia de ${nombreCliente}.`, severidad: 'info' });

    res.json(membresia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al renovar membresia', error: error.message });
  }
};

const cancelMembership = async (req, res) => {
  try {
    const membresia = await Membership.findById(req.params.id);
    if (!membresia) return res.status(404).json({ mensaje: 'Membresia no encontrada' });

    membresia.estado = 'cancelada';
    await membresia.save();

    res.json({ mensaje: 'Membresia cancelada', membresia });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cancelar membresia', error: error.message });
  }
};

const getMyPlanEnhanced = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) {
      return res.json({ plan: null });
    }

    const activa = await Membership.findOne({ cliente: cliente._id, estado: 'activa' })
      .sort({ fechaVencimiento: -1 });

    if (!activa) {
      const historial = await MembershipHistory.find({ cliente: cliente._id })
        .populate('planNuevo planAnterior')
        .sort({ fechaCambio: -1 });
      return res.json({ plan: null, historial });
    }

    let planInfo = null;
    if (activa.plan) {
      planInfo = await Plan.findById(activa.plan);
    }

    res.json({
      membresia: activa,
      planInfo,
      historial: await MembershipHistory.find({ cliente: cliente._id })
        .populate('planNuevo planAnterior')
        .sort({ fechaCambio: -1 })
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener plan', error: error.message });
  }
};

const changePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return res.status(400).json({ mensaje: 'Plan requerido' });

    const plan = await Plan.findById(planId);
    if (!plan || !plan.activo) return res.status(404).json({ mensaje: 'Plan no disponible' });

    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });

    const membresiaActiva = await Membership.findOne({ cliente: cliente._id, estado: 'activa' });

    const fechaInicio = new Date();
    const fechaVencimiento = new Date(fechaInicio);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + plan.duracionDias);

    const nuevaMembresia = await Membership.create({
      tipo: plan.nombre,
      fechaInicio,
      fechaVencimiento,
      cliente: cliente._id,
      precio: plan.precio,
      plan: plan._id,
      beneficios: plan.beneficios
    });

    await Payment.create({
      valor: plan.precio,
      metodoPago: 'Otro',
      cliente: cliente._id,
      membresia: nuevaMembresia._id
    });

    await MembershipHistory.create({
      cliente: cliente._id,
      planAnterior: membresiaActiva?.plan || null,
      planNuevo: plan._id,
      fechaInicio,
      fechaFin: fechaVencimiento,
      precio: plan.precio,
      estado: 'activa'
    });

    if (membresiaActiva) {
      membresiaActiva.estado = 'completada';
      await membresiaActiva.save();

      const historialAnterior = await MembershipHistory.findOne({
        cliente: cliente._id,
        planNuevo: membresiaActiva.plan,
        estado: 'activa'
      });
      if (historialAnterior) {
        historialAnterior.estado = 'completada';
        historialAnterior.fechaFin = new Date();
        await historialAnterior.save();
      }
    }

    res.json({ mensaje: 'Plan cambiado exitosamente', membresia: nuevaMembresia });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar plan', error: error.message });
  }
};

const getMembershipHistory = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });

    const historial = await MembershipHistory.find({ cliente: cliente._id })
      .populate('planNuevo planAnterior')
      .sort({ fechaCambio: -1 });

    res.json(historial);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener historial', error: error.message });
  }
};

module.exports = { createMembership, getAll, getActive, getExpired, getSemaforo, getMyPlan, getMyMemberships, getPrices, updatePrices, updateMembership, renewMembership, cancelMembership, getMyPlanEnhanced, changePlan, getMembershipHistory };
