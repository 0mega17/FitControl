const express = require('express');
const router = express.Router();
const planController = require('./controladorPlanes');
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

router.get('/', protect, planController.getAllPlans);
router.get('/:id', protect, planController.getPlan);
router.post('/', protect, authorize('Administrador'), planController.createPlan);
router.put('/:id', protect, authorize('Administrador'), planController.updatePlan);
router.delete('/:id', protect, authorize('Administrador'), planController.deletePlan);

module.exports = router;
