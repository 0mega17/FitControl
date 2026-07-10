const express = require('express');
const {
  createRequest, getMyRequests, getAllPending, getById,
  approveRequest, rejectRequest, assignRoutineToRequest
<<<<<<< HEAD:backend/modules/routineRequests/routineRequests.routes.js
} = require('./routineRequest.controller');
=======
} = require('./controladorSolicitudRutina');
>>>>>>> feb2d3cacb88bdb9e6de5d366b67189120f75f6b:backend/modules/routineRequests/rutasSolicitudRutina.js
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Cliente'), createRequest);
router.get('/mis', protect, authorize('Cliente'), getMyRequests);
router.get('/', protect, authorize('Administrador', 'Entrenador'), getAllPending);
router.get('/:id', protect, getById);
router.put('/:id/approve', protect, authorize('Administrador', 'Entrenador'), approveRequest);
router.put('/:id/reject', protect, authorize('Administrador', 'Entrenador'), rejectRequest);
router.post('/:id/assign-routine', protect, authorize('Administrador', 'Entrenador'), assignRoutineToRequest);

module.exports = router;
