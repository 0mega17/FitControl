const express = require('express');
const { create, getAll, getLast } = require('./controladorProgreso');
const { protect } = require('../../middleware/autenticacionMiddleware');

const router = express.Router();

router.post('/', protect, create);
router.get('/', protect, getAll);
router.get('/last', protect, getLast);
router.get('/:clienteId', protect, getAll);

module.exports = router;
