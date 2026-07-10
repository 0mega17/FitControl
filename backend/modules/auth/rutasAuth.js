/**
 * @module Autenticacion
 * @description Rutas de Autenticacion: registro, inicio de sesión, renovación de token y cierre de sesión.
 */

const express = require('express');
const { body } = require('express-validator');
const { registrar, iniciarSesion, renovarToken, cerrarSesion } = require('./controladorAuth');
const { validateFields } = require('../../middleware/validacionMiddleware');
const { protect } = require('../../middleware/autenticacionMiddleware');

const router = express.Router();

router.post('/registro', [
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validateFields
], registrar);

router.post('/iniciar-sesion', [
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validateFields
], iniciarSesion);

router.post('/renovar-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
  validateFields
], renovarToken);

router.post('/cerrar-sesion', protect, cerrarSesion);

module.exports = router;
