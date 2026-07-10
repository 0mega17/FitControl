/**
 * @module Autenticacion
 * @description Rutas de autenticación: registro, inicio de sesión, renovación de token y cierre de sesión.
 */

const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, logout } = require('./auth.controller');
const { validateFields } = require('../../middleware/validacionMiddleware');
const { protect } = require('../../middleware/autenticacionMiddleware');

const router = express.Router();

router.post('/register', [
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validateFields
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Correo electrónico inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  validateFields
], login);

router.post('/refresh-token', [
  body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
  validateFields
], refreshToken);

router.post('/logout', protect, logout);

module.exports = router;
