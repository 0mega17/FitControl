const express = require('express');
const router = express.Router();
<<<<<<< HEAD:backend/modules/plans/plans.routes.js
const planController = require('./plan.controller');
=======
const planController = require('./controladorPlanes');
>>>>>>> feb2d3cacb88bdb9e6de5d366b67189120f75f6b:backend/modules/plans/rutasPlanes.js
const { protect } = require('../../middleware/autenticacionMiddleware');
const { authorize } = require('../../middleware/rolMiddleware');

router.get('/', protect, planController.getAllPlans);
router.get('/:id', protect, planController.getPlan);
router.post('/', protect, authorize('Administrador'), planController.createPlan);
router.put('/:id', protect, authorize('Administrador'), planController.updatePlan);
router.delete('/:id', protect, authorize('Administrador'), planController.deletePlan);

module.exports = router;
