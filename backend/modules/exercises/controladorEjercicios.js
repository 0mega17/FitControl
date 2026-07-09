const exerciseService = require('../../services/servicioEjercicios');
const translationService = require('../../services/servicioTraduccion');

const list = async (req, res) => {
  try {
    const { cursor, limit = 20, bodyParts, targetMuscles, equipments, name } = req.query;

    const result = await exerciseService.listExercises({
      cursor,
      limit: Number(limit),
      bodyParts,
      targetMuscles,
      equipments,
      name
    });

    const translated = await translationService.translateExercises(result.data || []);

    res.json({
      success: true,
      count: translated.length,
      total: result.meta?.total || 0,
      hasNextPage: result.meta?.hasNextPage || false,
      hasPreviousPage: result.meta?.hasPreviousPage || false,
      nextCursor: result.meta?.nextCursor || null,
      results: translated
    });
  } catch (error) {
    console.error('[ExerciseController] list:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener ejercicios', error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const result = await exerciseService.getExerciseById(req.params.id);
    const translated = await translationService.translateExercise(result.data || result);
    res.json(translated);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ejercicio', error: error.message });
  }
};

const getBodyParts = async (req, res) => {
  try {
    const result = await exerciseService.listExercises({ limit: 200 });
    const parts = [...new Set((result.data || []).flatMap(ex => ex.bodyParts || []))].sort();
    const translated = await Promise.all(parts.map(async (p) => ({
      original: p,
      traducido: await translationService.translateText(p)
    })));
    res.json(translated);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener partes del cuerpo', error: error.message });
  }
};

const getTargetMuscles = async (req, res) => {
  try {
    const result = await exerciseService.listExercises({ limit: 200 });
    const muscles = [...new Set((result.data || []).flatMap(ex => ex.targetMuscles || []))].sort();
    const translated = await Promise.all(muscles.map(async (m) => ({
      original: m,
      traducido: await translationService.translateText(m)
    })));
    res.json(translated);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener músculos objetivo', error: error.message });
  }
};

const getEquipment = async (req, res) => {
  try {
    const result = await exerciseService.listExercises({ limit: 200 });
    const equip = [...new Set((result.data || []).flatMap(ex => ex.equipments || []))].sort();
    const translated = await Promise.all(equip.map(async (e) => ({
      original: e,
      traducido: await translationService.translateText(e)
    })));
    res.json(translated);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener equipamiento', error: error.message });
  }
};

module.exports = { list, getById, getBodyParts, getTargetMuscles, getEquipment };
