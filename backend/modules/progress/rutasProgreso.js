const express = require('express');
const { create, getAll, getLast } = require('./controladorProgreso');
const { protect } = require('../../middleware/autenticacionMiddleware');

/**
 * @module Progreso
 * @description Rutas de progreso físico: registro, historial y último registro.
 */

const router = express.Router();

router.post('/', protect, create);
router.get('/', protect, getAll);
router.get('/last', protect, getLast);
router.get('/:clienteId', protect, getAll);

module.exports = router;
