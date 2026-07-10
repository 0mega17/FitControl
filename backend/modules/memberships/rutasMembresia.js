/**
 * @module Membresias
 * @description Rutas de membresías: CRUD, semáforo, planes, precios e historial.
 */

const express = require('express');
const { createMembership, getAll, getActive, getExpired, getSemaforo, getMyPlan, getMyMemberships, getPrices, updatePrices, updateMembership, renewMembership, cancelMembership, getMyPlanEnhanced, changePlan, getMembershipHistory } = require('./controladorMembresia');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Administrador', 'Entrenador'), createMembership);
router.get('/', protect, getAll);
router.get('/semaforo', protect, getSemaforo);
router.get('/active', protect, getActive);
router.get('/expired', protect, getExpired);
router.get('/my-plan', protect, getMyPlan);
router.get('/my-plan-enhanced', protect, getMyPlanEnhanced);
router.get('/my', protect, authorize('Cliente'), getMyMemberships);
router.get('/prices', protect, getPrices);
router.put('/prices', protect, authorize('Administrador'), updatePrices);
router.put('/change-plan', protect, authorize('Cliente'), changePlan);
router.get('/history', protect, authorize('Cliente'), getMembershipHistory);
router.put('/:id', protect, authorize('Administrador', 'Entrenador'), updateMembership);
router.put('/:id/renew', protect, authorize('Administrador', 'Entrenador'), renewMembership);
router.put('/:id/cancel', protect, authorize('Administrador', 'Entrenador'), cancelMembership);

module.exports = router;
