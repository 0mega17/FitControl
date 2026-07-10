/**
 * @module Autenticacion
 * @description Controlador de Autenticacion: registro, inicio de sesión, renovación de token y cierre de sesión.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/Usuario');
const Role = require('../../models/Rol');
const Client = require('../../models/Cliente');
const Trainer = require('../../models/Entrenador');
const RefreshToken = require('../../models/TokenRefresco');
const Membership = require('../../models/Membresia');
const MembershipHistory = require('../../models/HistorialMembresia');
const { createNotification, notifyAllByRole } = require('../../services/servicioNotificaciones');

/**
 * @description Genera un token JWT con datos del usuario autenticado.
 * @param {Object} usuario - Documento de usuario (debe incluir _id, nombre, email, rol)
 * @returns {string} Token JWT firmado
 */
const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, nombre: usuario.nombre, correo: usuario.email, rol: usuario.rol?.nombre || usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * @description Crea un refresh token aleatorio de 40 bytes con expiraciÃ³n a 7 dÃ­as.
 * @param {string} usuarioId - ObjectId del usuario
 * @returns {Promise<string>} Token de refresco en hex
 */
const generarRefreshToken = async (usuarioId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    token,
    usuario: usuarioId,
    expiresAt
  });

  return token;
};

/**
 * @description Formatea la respuesta de autenticaciÃ³n con datos del usuario,
 *              token JWT y refresh token.
 * @param {Object} usuario
 * @param {string} token
 * @param {string} refreshToken
 * @returns {Object}
 */
const formatearUsuario = (usuario, token, refreshToken) => ({
  _id: usuario._id,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email,
  rol: usuario.rol,
  estado: usuario.estado,
  token,
  refreshToken
});

<<<<<<< HEAD
/**
 * @description Registra un nuevo usuario (cliente/entrenador) con datos de perfil,
 *              membresÃ­a opcional y notifica al administrador.
 * @route POST /api/auth/registro
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
=======
/** Registra un nuevo usuario en el sistema. */
>>>>>>> 897a290 (docs: reorganiza documentaciÃ³n JSDoc por mÃ³dulos)
const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, password, objetivo, edad, estatura, peso, experiencia, planId } = req.body;

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const rol = await Role.findOne({ nombre: 'Cliente' });
    if (!rol) {
      return res.status(400).json({ mensaje: 'Rol no válido' });
    }

    if (planId) {
      const Plan = require('../../models/Plan');
      const plan = await Plan.findById(planId);
      if (!plan || !plan.activo) {
        return res.status(400).json({ mensaje: 'El plan seleccionado no está disponible' });
      }
    }

    const usuario = await User.create({
      nombre: nombre || '',
      apellido: apellido || '',
      email,
      password,
      rol: rol._id
    });

    let cliente;
    if (rol.nombre === 'Cliente') {
      cliente = await Client.create({
        usuario: usuario._id,
        objetivo,
        edad,
        estatura,
        peso,
        experiencia
      });
    } else if (rol.nombre === 'Entrenador') {
      await Trainer.create({ usuario: usuario._id, especialidades: [] });
    }

    if (planId && cliente) {
      const Plan = require('../../models/Plan');
      const plan = await Plan.findById(planId);
      if (plan && plan.activo) {
        const fechaInicio = new Date();
        const fechaVencimiento = new Date(fechaInicio);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + plan.duracionDias);

        await Membership.create({
          tipo: plan.nombre,
          fechaInicio,
          fechaVencimiento,
          cliente: cliente._id,
          precio: plan.precio,
          plan: plan._id,
          beneficios: plan.beneficios
        });

        await MembershipHistory.create({
          cliente: cliente._id,
          planNuevo: plan._id,
          fechaInicio,
          fechaFin: fechaVencimiento,
          precio: plan.precio,
          estado: 'activa'
        });
      }
    }

    await notifyAllByRole({ rol: 'Administrador', asunto: 'Nuevo usuario registrado', mensaje: `Se registro un nuevo usuario: ${usuario.nombre || email} (Cliente).`, severidad: 'info' });

    const usuarioPoblado = await User.findById(usuario._id).populate('rol');
    const token = generarToken(usuarioPoblado);
    const refreshToken = await generarRefreshToken(usuarioPoblado._id);

    res.status(201).json(formatearUsuario(usuarioPoblado, token, refreshToken));
  } catch (error) {
    const { email } = req.body;
    if (email) {
      await User.deleteOne({ email });
    }
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

<<<<<<< HEAD
/**
 * @description Inicia sesiÃ³n con email y contraseÃ±a. Retorna JWT + refresh token.
 *              Rechaza cuentas inactivas o credenciales invÃ¡lidas.
 * @route POST /api/auth/iniciar-sesion
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
=======
/** Inicia sesión con credenciales de usuario. */
>>>>>>> 897a290 (docs: reorganiza documentaciÃ³n JSDoc por mÃ³dulos)
const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email }).populate('rol');
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    if (usuario.estado === 'inactivo') {
      return res.status(400).json({ mensaje: 'Cuenta desactivada' });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generarToken(usuario);
    const refreshToken = await generarRefreshToken(usuario._id);

    res.json(formatearUsuario(usuario, token, refreshToken));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

<<<<<<< HEAD
/**
 * @description Renueva el JWT usando un refresh token vÃ¡lido. Revoca el anterior.
 * @route POST /api/auth/renovar-token
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
=======
/** Renueva el token de acceso usando un refresh token. */
>>>>>>> 897a290 (docs: reorganiza documentaciÃ³n JSDoc por mÃ³dulos)
const renovarToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ mensaje: 'Refresh token requerido' });
    }

    const storedToken = await RefreshToken.findOne({ token, revoked: false }).populate({
      path: 'usuario',
      populate: { path: 'rol' }
    });

    if (!storedToken) {
      return res.status(401).json({ mensaje: 'Refresh token inválido' });
    }

    if (storedToken.isExpired()) {
      return res.status(401).json({ mensaje: 'Refresh token expirado, inicie sesión nuevamente' });
    }

    const usuario = storedToken.usuario;
    const newToken = generarToken(usuario);
    const newRefreshToken = await generarRefreshToken(usuario._id);

    storedToken.revoked = true;
    await storedToken.save();

    res.json(formatearUsuario(usuario, newToken, newRefreshToken));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al renovar token', error: error.message });
  }
};

<<<<<<< HEAD
/**
 * @description Revoca todos los refresh tokens activos del usuario autenticado.
 * @route POST /api/auth/cerrar-sesion
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
=======
/** Cierra la sesión del usuario revocando sus refresh tokens. */
>>>>>>> 897a290 (docs: reorganiza documentaciÃ³n JSDoc por mÃ³dulos)
const cerrarSesion = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await RefreshToken.updateMany({ usuario: req.user._id, revoked: false }, { revoked: true });
    }

    res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cerrar sesión', error: error.message });
  }
};

module.exports = { registrar, iniciarSesion, renovarToken, cerrarSesion };
