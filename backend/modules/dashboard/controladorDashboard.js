/**
 * @module Estadisticas
 * @description Controlador del dashboard: Estadisticas generales del gimnasio.
 */

const User = require('../../models/Usuario');
const Role = require('../../models/Rol');
const Membership = require('../../models/Membresia');

/** Obtiene Estadisticas generales del dashboard. */
const getStats = async (req, res) => {
  try {
    const rolCliente = await Role.findOne({ nombre: 'Cliente' });
    const rolEntrenador = await Role.findOne({ nombre: 'Entrenador' });

    const totalClientes = await User.countDocuments({ rol: rolCliente?._id, estado: 'activo' });
    const totalEntrenadores = await User.countDocuments({ rol: rolEntrenador?._id, estado: 'activo' });

    await Membership.updateMany(
      { fechaVencimiento: { $lt: new Date() }, estado: 'activa' },
      { estado: 'vencida' }
    );

    const membresiasActivas = await Membership.countDocuments({ estado: 'activa' });
    const membresiasVencidas = await Membership.countDocuments({ estado: 'vencida' });

    res.json({
      totalClientes,
      totalEntrenadores,
      membresiasActivas,
      membresiasVencidas
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener Estadisticas', error: error.message });
  }
};

module.exports = { getStats };
