const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  revoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * @description Verifica si el token de refresco ha expirado.
 * @returns {boolean}
 */
refreshTokenSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

/**
 * @description Verifica si el token de refresco es válido (no revocado y no expirado).
 * @returns {boolean}
 */
refreshTokenSchema.methods.isValid = function () {
  return !this.revoked && !this.isExpired();
};

/** @description Modelo de tokens de refresco JWT con expiración y revocación */
module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
