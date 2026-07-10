/**
 * @module Autenticacion
 */
const { validationResult } = require('express-validator');

/** Valida campos usando express-validator. */
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      mensaje: 'Error de validación',
      errores: errors.array().map(e => e.msg)
    });
  }
  next();
};

module.exports = { validateFields };
