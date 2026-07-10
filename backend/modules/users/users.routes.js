const express = require('express');
const { getProfile, updateProfile, getAllUsers, updateUser, deactivateUser, activateUser, changeUserRole } = require('./user.controller');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/list', protect, authorize('Administrador'), getAllUsers);
router.put('/:id', protect, authorize('Administrador'), updateUser);
router.put('/:id/deactivate', protect, authorize('Administrador'), deactivateUser);
router.put('/:id/activate', protect, authorize('Administrador'), activateUser);
router.put('/:id/role', protect, authorize('Administrador'), changeUserRole);

module.exports = router;
