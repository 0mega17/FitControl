const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    trim: true,
    default: ''
  },
  apellido: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  rol: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'inactivo'],
    default: 'activo'
  }
}, {
  timestamps: true
});

/**
 * @description Hook pre-save: hashea la contraseña con bcrypt solo si fue modificada.
 * @param {Function} next
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * @description Compara una contraseña en texto plano contra el hash almacenado.
 * @param {string} passwordIngresada
 * @returns {Promise<boolean>}
 */
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

/**
 * @description Override de toJSON: elimina el campo `password` del objeto serializado.
 * @returns {Object}
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

/** @description Modelo de usuarios con autenticación, roles y control de estado */
module.exports = mongoose.model('User', userSchema);
