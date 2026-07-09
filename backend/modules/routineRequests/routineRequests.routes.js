const express = require('express');
const {
  createRequest, getMyRequests, getAllPending, getById,
  approveRequest, rejectRequest, assignRoutineToRequest
} = require('./routineRequest.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Cliente'), createRequest);
router.get('/my', protect, authorize('Cliente'), getMyRequests);
router.get('/', protect, authorize('Administrador', 'Entrenador'), getAllPending);
router.get('/:id', protect, getById);
router.put('/:id/approve', protect, authorize('Administrador', 'Entrenador'), approveRequest);
router.put('/:id/reject', protect, authorize('Administrador', 'Entrenador'), rejectRequest);
router.post('/:id/assign-routine', protect, authorize('Administrador', 'Entrenador'), assignRoutineToRequest);

module.exports = router;
