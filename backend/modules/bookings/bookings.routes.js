const express = require('express');
const { create, getMyBookings, getAll, cancel } = require('./booking.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, create);
router.get('/my', protect, getMyBookings);
router.get('/', protect, authorize('Administrador', 'Entrenador'), getAll);
router.put('/:id/cancel', protect, cancel);

module.exports = router;
