const { validationResult } = require('express-validator');

/**
 * @description Middleware de validación: verifica errores de express-validator
 *              y retorna un array con los mensajes de error si existen.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
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
