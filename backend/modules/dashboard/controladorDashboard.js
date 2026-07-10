const User = require('../../models/Usuario');
const Role = require('../../models/Rol');
const Membership = require('../../models/Membresia');

/**
 * @description Obtiene estadísticas del dashboard: clientes activos, entrenadores,
 *              membresías activas y vencidas. Actualiza membresías vencidas automáticamente.
 * @route GET /api/dashboard
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
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
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
};

module.exports = { getStats };
