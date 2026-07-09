const express = require('express');
const { create, getAll, getById, update, remove, toggleInscripcion } = require('./controladorClases');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Administrador', 'Entrenador'), create);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);
router.put('/:id', protect, authorize('Administrador', 'Entrenador'), update);
router.delete('/:id', protect, authorize('Administrador'), remove);
router.post('/:id/inscribirse', protect, toggleInscripcion);

module.exports = router;
