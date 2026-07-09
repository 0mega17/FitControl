const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    const nombreRol = req.user.rol ? req.user.rol.nombre : null;

    if (!rolesPermitidos.includes(nombreRol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

module.exports = { authorize };
