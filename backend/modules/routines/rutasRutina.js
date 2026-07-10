/**
 * @module Rutinas
 * @description Rutas de rutinas: CRUD y asignación a clientes.
 */

const express = require('express');
const {
  crear, obtenerTodas, obtenerPorId, actualizar, eliminar, asignar, miRutina, listaClientes
} = require('./controladorRutina');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/mi-rutina', protect, authorize('Cliente'), miRutina);
router.get('/clientes/lista', protect, authorize('Administrador', 'Entrenador'), listaClientes);
router.post('/', protect, authorize('Administrador', 'Entrenador'), crear);
router.get('/', protect, obtenerTodas);
router.get('/:id', protect, obtenerPorId);
router.put('/:id', protect, authorize('Administrador', 'Entrenador'), actualizar);
router.delete('/:id', protect, authorize('Administrador', 'Entrenador'), eliminar);
router.post('/:id/assign', protect, authorize('Administrador', 'Entrenador'), asignar);

module.exports = router;
