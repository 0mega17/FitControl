const express = require('express');
const { getReport, getDashboardStats } = require('./report.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('Administrador'), getDashboardStats);
router.get('/', protect, authorize('Administrador'), getReport);

module.exports = router;
