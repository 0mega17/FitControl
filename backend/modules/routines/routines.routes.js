const express = require('express');
const {
  create, getAll, getById, update, remove, assign, myRoutine, listClients
} = require('./routine.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

const router = express.Router();

router.get('/my-routine', protect, authorize('Cliente'), myRoutine);
router.get('/clients/list', protect, authorize('Administrador', 'Entrenador'), listClients);
router.post('/', protect, authorize('Administrador', 'Entrenador'), create);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);
router.put('/:id', protect, authorize('Administrador', 'Entrenador'), update);
router.delete('/:id', protect, authorize('Administrador', 'Entrenador'), remove);
router.post('/:id/assign', protect, authorize('Administrador', 'Entrenador'), assign);

module.exports = router;
