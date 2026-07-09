const ClassGroup = require('../../models/ClaseGrupal');
const Trainer = require('../../models/Entrenador');
const Client = require('../../models/Cliente');

/**
 * @description Crea una nueva clase grupal (solo administradores y entrenadores).
 * @route POST /api/classes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const create = async (req, res) => {
  try {
    let entrenador = await Trainer.findOne({ usuario: req.user._id });

    if (!entrenador && req.user.rol?.nombre === 'Administrador') {
      if (req.body.entrenadorId) {
        entrenador = await Trainer.findById(req.body.entrenadorId);
        if (!entrenador) return res.status(400).json({ mensaje: 'Entrenador no encontrado' });
      }
    }

    if (!entrenador) return res.status(403).json({ mensaje: 'Solo entrenadores pueden crear clases' });

    const clase = await ClassGroup.create({
      ...req.body,
      entrenador: req.body.entrenadorId || entrenador._id
    });
    res.status(201).json(clase);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear clase', error: error.message });
  }
};

/**
 * @description Obtiene todas las clases grupales activas con entrenador e inscritos.
 * @route GET /api/classes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getAll = async (req, res) => {
  try {
    const clases = await ClassGroup.find({ activa: true })
      .populate({ path: 'entrenador', populate: { path: 'usuario', select: 'nombre apellido' } })
      .populate({ path: 'inscritos', populate: { path: 'usuario', select: 'nombre apellido' } });
    res.json(clases);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clases', error: error.message });
  }
};

/**
 * @description Obtiene una clase grupal por su ID.
 * @route GET /api/classes/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const getById = async (req, res) => {
  try {
    const clase = await ClassGroup.findById(req.params.id)
      .populate({ path: 'entrenador', populate: { path: 'usuario', select: 'nombre apellido' } })
      .populate({ path: 'inscritos', populate: { path: 'usuario', select: 'nombre apellido' } });
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    res.json(clase);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener clase', error: error.message });
  }
};

/**
 * @description Actualiza los datos de una clase grupal.
 * @route PUT /api/classes/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const update = async (req, res) => {
  try {
    const clase = await ClassGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    res.json(clase);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar clase', error: error.message });
  }
};

/**
 * @description Elimina una clase grupal por su ID.
 * @route DELETE /api/classes/:id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const remove = async (req, res) => {
  try {
    await ClassGroup.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Clase eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar clase', error: error.message });
  }
};

/**
 * @description Inscribe o desinscribe al cliente autenticado de una clase grupal.
 *              Verifica capacidad máxima antes de inscribir.
 * @route POST /api/classes/:id/inscribirse
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
const toggleInscripcion = async (req, res) => {
  try {
    const clase = await ClassGroup.findById(req.params.id);
    if (!clase) return res.status(404).json({ mensaje: 'Clase no encontrada' });
    if (!clase.activa) return res.status(400).json({ mensaje: 'Clase no activa' });

    const cliente = await Client.findOne({ usuario: req.user._id });
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

    const idx = clase.inscritos.indexOf(cliente._id);
    if (idx === -1) {
      if (clase.inscritos.length >= clase.capacidad)
        return res.status(400).json({ mensaje: 'Clase llena' });
      clase.inscritos.push(cliente._id);
    } else {
      clase.inscritos.splice(idx, 1);
    }
    await clase.save();
    res.json(clase);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al inscribirse', error: error.message });
  }
};

module.exports = { create, getAll, getById, update, remove, toggleInscripcion };
