const Progress = require('../../models/Progreso');
const Client = require('../../models/Cliente');

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
