const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, logout } = require('./auth.controller');
const { validateFields } = require('../../middleware/validateMiddleware');
const { protect } = require('../../middleware/authMiddleware');

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
