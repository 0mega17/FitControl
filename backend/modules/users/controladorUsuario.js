/**
 * @module Usuarios
 * @description Controlador de usuarios: perfil, listado, actualización, activación/desactivación y cambio de rol.
 */

const Usuario = require('../../models/Usuario');
const Cliente = require('../../models/Cliente');
const Entrenador = require('../../models/Entrenador');

/** Obtiene el perfil del usuario autenticado. */
const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.user._id).populate('rol');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    let perfilExtra = null;
    if (usuario.rol.nombre === 'Cliente') {
      perfilExtra = await Cliente.findOne({ usuario: usuario._id });
    } else if (usuario.rol.nombre === 'Entrenador') {
      perfilExtra = await Entrenador.findOne({ usuario: usuario._id });
    }

    res.json({ usuario, perfilExtra });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message });
  }
};

/** Obtiene la lista de usuarios, opcionalmente filtrada por rol. */
const obtenerUsuarios = async (req, res) => {
  try {
    const { rol } = req.query;
    const filter = rol ? { 'rol.nombre': rol } : {};
    const usuarios = await Usuario.find().populate('rol', 'nombre').select('-password');
    const filtered = rol ? usuarios.filter(u => u.rol?.nombre === rol) : usuarios;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

/** Actualiza los datos de un usuario por su ID. */
const actualizarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email } = req.body;
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (nombre !== undefined) usuario.nombre = nombre;
    if (apellido !== undefined) usuario.apellido = apellido;
    if (email !== undefined) usuario.email = email;
    await usuario.save();

    res.json({ mensaje: 'Usuario actualizado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
};

/** Desactiva un usuario por su ID. */
const desactivarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    usuario.estado = 'inactivo';
    await usuario.save();
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar usuario', error: error.message });
  }
};

/** Activa un usuario previamente desactivado. */
const activarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    usuario.estado = 'activo';
    await usuario.save();
    res.json({ mensaje: 'Usuario activado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al activar usuario', error: error.message });
  }
};

/** Cambia el rol de un usuario. */
const cambiarRol = async (req, res) => {
  try {
    const { rolId } = req.body;
    const Rol = require('../../models/Rol');
    const rol = await Rol.findById(rolId);
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado' });

    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.rol = rol._id;
    await usuario.save();

    if (usuario.rol.nombre !== 'Cliente') {
      await Cliente.findOneAndDelete({ usuario: usuario._id });
    }

    res.json({ mensaje: 'Rol actualizado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar rol', error: error.message });
  }
};

/** Actualiza el perfil del usuario autenticado. */
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono, fechaNacimiento, direccion, especialidades } = req.body;

    const usuario = await Usuario.findById(req.user._id).populate('rol');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    await usuario.save();

    if (usuario.rol.nombre === 'Cliente') {
      const cliente = await Cliente.findOne({ usuario: usuario._id });
      if (cliente) {
        if (telefono !== undefined) cliente.telefono = telefono;
        if (fechaNacimiento !== undefined) cliente.fechaNacimiento = fechaNacimiento;
        if (direccion !== undefined) cliente.direccion = direccion;
        await cliente.save();
      }
    } else if (usuario.rol.nombre === 'Entrenador') {
      const entrenador = await Entrenador.findOne({ usuario: usuario._id });
      if (entrenador) {
        if (telefono !== undefined) entrenador.telefono = telefono;
        if (especialidades !== undefined) entrenador.especialidades = especialidades;
        await entrenador.save();
      }
    }

    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: error.message });
  }
};

module.exports = { obtenerPerfil, actualizarPerfil, obtenerUsuarios, actualizarUsuario, desactivarUsuario, activarUsuario, cambiarRol };
