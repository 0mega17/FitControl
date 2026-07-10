const express = require('express');
const { list, getById, getBodyParts, getTargetMuscles, getEquipment } = require('./controladorEjercicios');
const { protect } = require('../../middleware/autenticacionMiddleware');

/**
 * @module Ejercicios
 * @description Rutas de ejercicios: listado, detalle, partes del cuerpo, músculos y equipamiento.
 */

const router = express.Router();

router.get('/', protect, list);
router.get('/body-parts', protect, getBodyParts);
router.get('/target-muscles', protect, getTargetMuscles);
router.get('/equipment', protect, getEquipment);
router.get('/:id', protect, getById);

module.exports = router;
