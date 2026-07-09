const User = require('../../models/User');
const Client = require('../../models/Client');
const Trainer = require('../../models/Trainer');

const getProfile = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).populate('rol');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    let perfilExtra = null;
    if (usuario.rol.nombre === 'Cliente') {
      perfilExtra = await Client.findOne({ usuario: usuario._id });
    } else if (usuario.rol.nombre === 'Entrenador') {
      perfilExtra = await Trainer.findOne({ usuario: usuario._id });
    }

    res.json({ usuario, perfilExtra });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { rol } = req.query;
    const filter = rol ? { 'rol.nombre': rol } : {};
    const usuarios = await User.find().populate('rol', 'nombre').select('-password');
    const filtered = rol ? usuarios.filter(u => u.rol?.nombre === rol) : usuarios;
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { nombre, apellido, email } = req.body;
    const usuario = await User.findById(req.params.id);
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

const deactivateUser = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    usuario.estado = 'inactivo';
    await usuario.save();
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desactivar usuario', error: error.message });
  }
};

const activateUser = async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    usuario.estado = 'activo';
    await usuario.save();
    res.json({ mensaje: 'Usuario activado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al activar usuario', error: error.message });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { rolId } = req.body;
    const Role = require('../../models/Role');
    const rol = await Role.findById(rolId);
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado' });

    const usuario = await User.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.rol = rol._id;
    await usuario.save();

    // If changing from Cliente, delete Client record
    if (usuario.rol.nombre !== 'Cliente') {
      await Client.findOneAndDelete({ usuario: usuario._id });
    }

    res.json({ mensaje: 'Rol actualizado correctamente', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar rol', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nombre, apellido, telefono, fechaNacimiento, direccion, especialidades } = req.body;

    const usuario = await User.findById(req.user._id).populate('rol');
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    await usuario.save();

    if (usuario.rol.nombre === 'Cliente') {
      const cliente = await Client.findOne({ usuario: usuario._id });
      if (cliente) {
        if (telefono !== undefined) cliente.telefono = telefono;
        if (fechaNacimiento !== undefined) cliente.fechaNacimiento = fechaNacimiento;
        if (direccion !== undefined) cliente.direccion = direccion;
        await cliente.save();
      }
    } else if (usuario.rol.nombre === 'Entrenador') {
      const entrenador = await Trainer.findOne({ usuario: usuario._id });
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

module.exports = { getProfile, updateProfile, getAllUsers, updateUser, deactivateUser, activateUser, changeUserRole };
