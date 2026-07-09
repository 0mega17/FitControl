const Plan = require('../../models/Plan');

exports.getAllPlans = async (req, res) => {
  try {
    const filter = req.user?.rol?.nombre === 'Administrador' ? {} : { activo: true };
    const plans = await Plan.find(filter).sort({ precio: 1 });
    res.json(plans);
  } catch (error) {
    console.error('Error al obtener planes:', error);
    res.status(500).json({ message: 'Error al obtener planes' });
  }
};

exports.getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    if (!plan.activo && req.user?.rol?.nombre !== 'Administrador') {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
    res.json(plan);
  } catch (error) {
    console.error('Error al obtener plan:', error);
    res.status(500).json({ message: 'Error al obtener plan' });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const { nombre, precio, duracionDias, beneficios, descripcion } = req.body;
    const plan = new Plan({ nombre, precio, duracionDias, beneficios, descripcion });
    await plan.save();
    res.status(201).json({ message: 'Plan creado exitosamente', plan });
  } catch (error) {
    console.error('Error al crear plan:', error);
    res.status(500).json({ message: 'Error al crear plan' });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { nombre, precio, duracionDias, beneficios, descripcion, activo } = req.body;
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { nombre, precio, duracionDias, beneficios, descripcion, activo },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json({ message: 'Plan actualizado exitosamente', plan });
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    res.status(500).json({ message: 'Error al actualizar plan' });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json({ message: 'Plan eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    res.status(500).json({ message: 'Error al eliminar plan' });
  }
};
