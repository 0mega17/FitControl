const express = require('express');
const { getStats } = require('./dashboard.controller');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('Administrador'), getStats);

module.exports = router;
