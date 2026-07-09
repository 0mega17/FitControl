const User = require('../../models/Usuario');
const Role = require('../../models/Rol');
const Membership = require('../../models/Membresia');
const Payment = require('../../models/Pago');
const Attendance = require('../../models/Asistencia');

const getReport = async (req, res) => {
  try {
    const { tipo, desde, hasta } = req.query;
    const start = desde ? new Date(desde) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = hasta ? new Date(hasta) : new Date();

    const rolCliente = await Role.findOne({ nombre: 'Cliente' });
    const totalClientes = await User.countDocuments({ rol: rolCliente?._id, estado: 'activo' });

    const pagos = await Payment.find({ fechaPago: { $gte: start, $lte: end } });
    const totalIngresos = pagos.reduce((sum, p) => sum + p.valor, 0);

    const asistencias = await Attendance.countDocuments({ fecha: { $gte: start, $lte: end } });
    const asistenciasPorDia = await Attendance.aggregate([
      { $match: { fecha: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const membresiasVendidas = await Membership.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const distribucionMembresias = await Membership.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$tipo', count: { $sum: 1 }, total: { $sum: '$precio' } } }
    ]);

    res.json({
      periodo: { desde: start, hasta: end },
      totalClientes,
      totalIngresos,
      totalPagos: pagos.length,
      totalAsistencias: asistencias,
      asistenciasPorDia,
      membresiasVendidas,
      distribucionMembresias,
      ultimosPagos: pagos.slice(-10).reverse()
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al generar reporte', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const rolCliente = await Role.findOne({ nombre: 'Cliente' });
    const rolEntrenador = await Role.findOne({ nombre: 'Entrenador' });

    const totalClientes = await User.countDocuments({ rol: rolCliente?._id, estado: 'activo' });
    const totalEntrenadores = await User.countDocuments({ rol: rolEntrenador?._id, estado: 'activo' });

    await Membership.updateMany(
      { fechaVencimiento: { $lt: new Date() }, estado: 'activa' },
      { estado: 'vencida' }
    );

    const hace7Dias = new Date(new Date().setDate(new Date().getDate() + 7));
    const membresiasActivas = await Membership.countDocuments({ estado: 'activa' });
    const membresiasPorVencer = await Membership.countDocuments({ estado: 'activa', fechaVencimiento: { $lte: hace7Dias, $gte: new Date() } });
    const membresiasVencidas = await Membership.countDocuments({ estado: 'vencida' });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const asistenciasHoy = await Attendance.countDocuments({ fecha: { $gte: hoy, $lt: manana } });

    const mesInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const pagosMes = await Payment.find({ fechaPago: { $gte: mesInicio } });
    const ingresosMes = pagosMes.reduce((sum, p) => sum + p.valor, 0);

    res.json({
      totalClientes, totalEntrenadores, membresiasActivas,
      membresiasPorVencer, membresiasVencidas, asistenciasHoy, ingresosMes
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
};

module.exports = { getReport, getDashboardStats };
