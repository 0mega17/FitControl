/**
 * @module Estadisticas
 * @description Rutas de reportes y estadísticas del dashboard.
 */

const express = require('express');
const { getReport, getDashboardStats } = require('./report.controller');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('Administrador'), getDashboardStats);
router.get('/', protect, authorize('Administrador'), getReport);

module.exports = router;
