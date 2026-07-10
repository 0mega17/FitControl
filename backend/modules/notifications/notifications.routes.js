const express = require('express');
const { create, getMyNotifications, getAll, markAsRead, markAllAsRead, getUnreadCount, sendTestEmail, sendTestWhatsApp } = require('./notification.controller');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

/**
 * @module Notificaciones
 * @description Rutas de notificaciones del sistema.
 */

const router = express.Router();

router.post('/', protect, authorize('Administrador'), create);
router.get('/my', protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, authorize('Administrador'), getAll);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.post('/test-email', protect, authorize('Administrador'), sendTestEmail);
router.post('/test-whatsapp', protect, authorize('Administrador'), sendTestWhatsApp);

module.exports = router;
