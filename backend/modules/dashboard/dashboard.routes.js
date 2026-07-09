const express = require('express');
const { getStats } = require('./dashboard.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('Administrador'), getStats);

module.exports = router;
