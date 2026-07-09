const express = require('express');
const {
  create, getAll, getById, update, remove, assign, myRoutine, listClients
<<<<<<< HEAD:backend/modules/routines/routines.routes.js
} = require('./routine.controller');
=======
} = require('./controladorRutina');
>>>>>>> feb2d3cacb88bdb9e6de5d366b67189120f75f6b:backend/modules/routines/rutasRutina.js
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/mi-rutina', protect, authorize('Cliente'), myRoutine);
router.get('/clientes/lista', protect, authorize('Administrador', 'Entrenador'), listClients);
router.post('/', protect, authorize('Administrador', 'Entrenador'), create);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);
router.put('/:id', protect, authorize('Administrador', 'Entrenador'), update);
router.delete('/:id', protect, authorize('Administrador', 'Entrenador'), remove);
router.post('/:id/assign', protect, authorize('Administrador', 'Entrenador'), assign);

module.exports = router;
