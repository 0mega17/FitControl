const Progress = require('../../models/Progreso');
const Client = require('../../models/Cliente');

/**
 * @description Registra una medición de progreso físico para un cliente.
 * @route POST /api/progress
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const create = async (req, res) => {
  try {
    const { clienteId, peso, altura, porcentajeGrasa, medidas, observaciones } = req.body;
    const progreso = await Progress.create({
      cliente: clienteId || (await Client.findOne({ usuario: req.user._id }))._id,
      peso, altura, porcentajeGrasa, medidas, observaciones,
      registradoPor: req.user._id
    });
    res.status(201).json(progreso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar progreso', error: error.message });
  }
};

/**
 * @description Obtiene el historial de progreso de un cliente.
 * @route GET /api/progress/:clienteId?
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getAll = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    let filter = {};
    if (req.params.clienteId) filter.cliente = req.params.clienteId;
    else if (cliente) filter.cliente = cliente._id;

    const progresos = await Progress.find(filter)
      .populate({ path: 'cliente', populate: { path: 'usuario', select: 'nombre apellido' } })
      .sort({ fecha: -1 });
    res.json(progresos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener progresos', error: error.message });
  }
};

/**
 * @description Obtiene la última medición de progreso del cliente autenticado.
 * @route GET /api/progress/last
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getLast = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    const progreso = await Progress.findOne({ cliente: cliente._id })
      .sort({ fecha: -1 });
    res.json(progreso);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener último progreso', error: error.message });
  }
};

module.exports = { create, getAll, getLast };
