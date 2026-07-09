const express = require('express');
const { generateQR, registerByQR, registerManual, getByClient, getAll } = require('./attendance.controller');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/qr', protect, generateQR);
router.post('/qr', protect, registerByQR);
router.post('/manual', protect, authorize('Administrador', 'Entrenador'), registerManual);
router.get('/my', protect, getByClient);
router.get('/', protect, authorize('Administrador', 'Entrenador'), getAll);

module.exports = router;
