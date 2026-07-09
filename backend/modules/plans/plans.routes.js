const express = require('express');
const router = express.Router();
const planController = require('./plan.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.get('/', protect, planController.getAllPlans);
router.get('/:id', protect, planController.getPlan);
router.post('/', protect, authorize('Administrador'), planController.createPlan);
router.put('/:id', protect, authorize('Administrador'), planController.updatePlan);
router.delete('/:id', protect, authorize('Administrador'), planController.deletePlan);

module.exports = router;
