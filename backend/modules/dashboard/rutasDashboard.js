/**
 * @module Estadisticas
 * @description Rutas del dashboard: Estadisticas generales.
 */

const express = require('express');
const { getStats } = require('./controladorDashboard');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('Administrador'), getStats);

module.exports = router;
