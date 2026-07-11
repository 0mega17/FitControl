/**
 * @module Autenticacion
 * @description Controlador de Autenticacion: registro, inicio de sesi�n, renovaci�n de token y cierre de sesi�n.
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
 * @description Crea un refresh token aleatorio de 40 bytes con expiración a 7 días.
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
 * @description Formatea la respuesta de autenticación con datos del usuario,
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

/** Registra un nuevo usuario en el sistema. */
const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, password, objetivo, edad, estatura, peso, experiencia, planId } = req.body;

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'El correo ya est� registrado' });
    }

    const rol = await Role.findOne({ nombre: 'Cliente' });
    if (!rol) {
      return res.status(400).json({ mensaje: 'Rol no v�lido' });
    }

    if (planId) {
      const Plan = require('../../models/Plan');
      const plan = await Plan.findById(planId);
      if (!plan || !plan.activo) {
        return res.status(400).json({ mensaje: 'El plan seleccionado no est� disponible' });
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

/** Inicia sesi�n con credenciales de usuario. */
const iniciarSesion = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ email }).populate('rol');
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inv�lidas' });
    }

    if (usuario.estado === 'inactivo') {
      return res.status(400).json({ mensaje: 'Cuenta desactivada' });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'Credenciales inv�lidas' });
    }

    const token = generarToken(usuario);
    const refreshToken = await generarRefreshToken(usuario._id);

    res.json(formatearUsuario(usuario, token, refreshToken));
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesi�n', error: error.message });
  }
};

/** Renueva el token de acceso usando un refresh token. */
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
      return res.status(401).json({ mensaje: 'Refresh token inv�lido' });
    }

    if (storedToken.isExpired()) {
      return res.status(401).json({ mensaje: 'Refresh token expirado, inicie sesi�n nuevamente' });
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

/** Cierra la sesi�n del usuario revocando sus refresh tokens. */
const cerrarSesion = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await RefreshToken.updateMany({ usuario: req.user._id, revoked: false }, { revoked: true });
    }

    res.json({ mensaje: 'Sesi�n cerrada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cerrar sesi�n', error: error.message });
  }
};

module.exports = { registrar, iniciarSesion, renovarToken, cerrarSesion };
