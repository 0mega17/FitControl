/**
 * @module Planes
 * @description Rutas de planes de membresía: CRUD.
 */

const express = require('express');
const planController = require('./controladorPlanes');

const router = express.Router();
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

router.get('/', protect, planController.getAllPlans);
router.get('/:id', protect, planController.getPlan);
router.post('/', protect, authorize('Administrador'), planController.createPlan);
router.put('/:id', protect, authorize('Administrador'), planController.updatePlan);
router.delete('/:id', protect, authorize('Administrador'), planController.deletePlan);

module.exports = router;
