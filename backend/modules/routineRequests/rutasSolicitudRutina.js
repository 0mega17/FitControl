/**
 * @module SolicitudesRutinas
 * @description Rutas de solicitudes de rutina personalizada.
 */

const express = require('express');
const {
  crearSolicitud, obtenerMisSolicitudes, obtenerPendientes, obtenerPorId,
  aprobarSolicitud, rechazarSolicitud, asignarRutina
} = require('./controladorSolicitudRutina');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Cliente'), crearSolicitud);
router.get('/mis', protect, authorize('Cliente'), obtenerMisSolicitudes);
router.get('/', protect, authorize('Administrador', 'Entrenador'), obtenerPendientes);
router.get('/:id', protect, obtenerPorId);
router.put('/:id/approve', protect, authorize('Administrador', 'Entrenador'), aprobarSolicitud);
router.put('/:id/reject', protect, authorize('Administrador', 'Entrenador'), rechazarSolicitud);
router.post('/:id/assign-routine', protect, authorize('Administrador', 'Entrenador'), asignarRutina);

module.exports = router;
