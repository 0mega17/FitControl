const express = require('express');
const { create, getMyBookings, getAll, cancel } = require('./controladorReservas');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.post('/', protect, create);
router.get('/my', protect, getMyBookings);
router.get('/', protect, authorize('Administrador', 'Entrenador'), getAll);
router.put('/:id/cancel', protect, cancel);

module.exports = router;
