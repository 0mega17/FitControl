const User = require('../../models/User');
const Role = require('../../models/Role');
const Membership = require('../../models/Membership');

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
