/**
 * @module Usuarios
 * @description Rutas de usuarios: perfil, listado, actualización, activación/desactivación y cambio de rol.
 */

const express = require('express');
const { obtenerPerfil, actualizarPerfil, obtenerUsuarios, actualizarUsuario, desactivarUsuario, activarUsuario, cambiarRol } = require('./controladorUsuario');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/perfil', protect, obtenerPerfil);
router.put('/perfil', protect, actualizarPerfil);
router.get('/lista', protect, authorize('Administrador'), obtenerUsuarios);
router.put('/:id', protect, authorize('Administrador'), actualizarUsuario);
router.put('/:id/desactivar', protect, authorize('Administrador'), desactivarUsuario);
router.put('/:id/activar', protect, authorize('Administrador'), activarUsuario);
router.put('/:id/rol', protect, authorize('Administrador'), cambiarRol);

module.exports = router;
