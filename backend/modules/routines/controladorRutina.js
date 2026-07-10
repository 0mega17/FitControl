const Routine = require('../../models/Rutina');
const AssignedRoutine = require('../../models/RutinaAsignada');
const Client = require('../../models/Cliente');
const User = require('../../models/Usuario');
const { createNotification } = require('../../services/servicioNotificaciones');

const crear = async (req, res) => {
  try {
    const { nombre, descripcion, nivel, objetivo, grupoMuscularPrincipal, grupoMuscularSecundario, ejercicios } = req.body;

    if (!nombre || !nivel || !objetivo || !grupoMuscularPrincipal || !ejercicios?.length) {
      return res.status(400).json({ mensaje: 'Faltan campos requeridos' });
    }

    const rutina = await Routine.create({
      nombre, descripcion, nivel, objetivo,
      grupoMuscularPrincipal, grupoMuscularSecundario,
      ejercicios: ejercicios.map((ex, i) => ({ ...ex, orden: i })),
      creadoPor: req.user._id,
      esPlantilla: req.body.esPlantilla !== undefined ? req.body.esPlantilla : true
    });

    res.status(201).json(rutina);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear rutina', error: error.message });
  }
};

const obtenerTodas = async (req, res) => {
  try {
    const rutinas = await Routine.find({ esPlantilla: true })
      .populate('creadoPor', 'nombre apellido')
      .sort({ createdAt: -1 });
    res.json(rutinas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener rutinas', error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const rutina = await Routine.findById(req.params.id)
      .populate('creadoPor', 'nombre apellido');
    if (!rutina) return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener rutina', error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const { ejercicios, ...data } = req.body;
    const updateData = { ...data };
    if (ejercicios) {
      updateData.ejercicios = ejercicios.map((ex, i) => ({ ...ex, orden: i }));
    }

    const rutina = await Routine.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!rutina) return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    res.json(rutina);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar rutina', error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await AssignedRoutine.deleteMany({ rutina: req.params.id });
    const rutina = await Routine.findByIdAndDelete(req.params.id);
    if (!rutina) return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    res.json({ mensaje: 'Rutina eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar rutina', error: error.message });
  }
};

const asignar = async (req, res) => {
  try {
    const { clienteId } = req.body;
    const rutina = await Routine.findById(req.params.id);
    if (!rutina) return res.status(404).json({ mensaje: 'Rutina no encontrada' });

    const cliente = await Client.findById(clienteId);
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const existente = await AssignedRoutine.findOne({
      rutina: req.params.id, cliente: clienteId, estado: 'activa'
    });
    if (existente) {
      return res.status(400).json({ mensaje: 'El cliente ya tiene esta rutina asignada' });
    }

    const asignada = await AssignedRoutine.create({
      rutina: req.params.id, cliente: clienteId, asignadoPor: req.user._id
    });

    await createNotification({ usuarioId: cliente.usuario, asunto: 'Rutina asignada', mensaje: 'Se te ha asignado una nueva rutina.', severidad: 'success' });

    res.status(201).json(asignada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar rutina', error: error.message });
  }
};

const miRutina = async (req, res) => {
  try {
    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Perfil de cliente no encontrado' });

    const asignada = await AssignedRoutine.findOne({ cliente: cliente._id, estado: 'activa' })
      .populate({
        path: 'rutina',
        populate: { path: 'creadoPor', select: 'nombre apellido' }
      });

    if (!asignada) return res.json(null);
    res.json(asignada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener rutina', error: error.message });
  }
};

const listaClientes = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate('usuario', 'nombre apellido email')
      .sort({ 'usuario.nombre': 1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clientes', error: error.message });
  }
};

module.exports = { crear, obtenerTodas, obtenerPorId, actualizar, eliminar, asignar, miRutina, listaClientes };
