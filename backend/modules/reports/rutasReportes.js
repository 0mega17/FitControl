const express = require('express');
const { getReport, getDashboardStats } = require('./controladorReportes');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('Administrador'), getDashboardStats);
router.get('/', protect, authorize('Administrador'), getReport);

module.exports = router;
