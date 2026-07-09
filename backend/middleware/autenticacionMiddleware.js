const jwt = require('jsonwebtoken');
const User = require('../models/Usuario');

/**
 * @description Middleware que protege rutas verificando un token JWT Bearer.
 *              Adjunta `req.user` con datos del usuario autenticado.
 *              Rechaza cuentas inactivas y tokens expirados o inválidos.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password').populate('rol');

      if (!req.user) {
        return res.status(401).json({ mensaje: 'Usuario no encontrado' });
      }

      if (req.user.estado === 'inactivo') {
        return res.status(401).json({ mensaje: 'Cuenta desactivada' });
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ mensaje: 'Token expirado', codigo: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ mensaje: 'Token no válido' });
    }
  } else {
    return res.status(401).json({ mensaje: 'Acceso denegado, token requerido' });
  }
};

module.exports = { protect };
