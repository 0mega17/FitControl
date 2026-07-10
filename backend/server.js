const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Role = require('./models/Rol');
const Plan = require('./models/Plan');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

/**
 * @description Siembra los roles por defecto (Administrador, Entrenador, Cliente)
 *              usando upsert para evitar duplicados.
 * @returns {Promise<void>}
 */
const seedRoles = async () => {
  const roles = ['Administrador', 'Entrenador', 'Cliente'];
  for (const nombre of roles) {
    await Role.findOneAndUpdate(
      { nombre },
      { nombre },
      { upsert: true, new: true }
    );
  }
  console.log('Roles inicializados');
};
seedRoles();

/**
 * @description Siembra los planes de membresía por defecto
 *              (Básico, Estándar, Premium, Trimestral, Anual).
 * @returns {Promise<void>}
 */
const seedPlans = async () => {
  const defaultPlans = [
    { nombre: 'Básico', precio: 70000, duracionDias: 30, beneficios: ['Acceso al gimnasio en horario regular', 'Vestidores y regaderas'], descripcion: 'Plan ideal para quienes inician', activo: true },
    { nombre: 'Estándar', precio: 120000, duracionDias: 30, beneficios: ['Acceso al gimnasio en cualquier horario', 'Vestidores y regaderas', 'Acceso a clases grupales'], descripcion: 'Nuestro plan más popular', activo: true },
    { nombre: 'Premium', precio: 180000, duracionDias: 30, beneficios: ['Acceso ilimitado al gimnasio', 'Vestidores y regaderas premium', 'Acceso a todas las clases', 'Entrenador personal incluido', 'Nutricionista'], descripcion: 'La experiencia completa', activo: true },
    { nombre: 'Trimestral Básico', precio: 180000, duracionDias: 90, beneficios: ['Acceso al gimnasio en horario regular', 'Vestidores y regaderas', '3 meses al mejor precio'], descripcion: 'Plan básico con descuento trimestral', activo: true },
    { nombre: 'Anual Premium', precio: 600000, duracionDias: 365, beneficios: ['Todo incluido del plan Premium', 'Pase de invitado (2 al mes)', 'Estacionamiento gratuito', 'Descuento en tienda'], descripcion: 'Nuestro mejor precio por año', activo: true }
  ];
  for (const planData of defaultPlans) {
    await Plan.findOneAndUpdate(
      { nombre: planData.nombre },
      planData,
      { upsert: true, new: true }
    );
  }
  console.log('Planes inicializados');
};
seedPlans();

app.use('/api/auth', require('./modules/auth/rutasAuth'));
app.use('/api/users', require('./modules/users/rutasUsuario'));
app.use('/api/memberships', require('./modules/memberships/memberships.routes'));
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));
app.use('/api/routines', require('./modules/routines/routines.routes'));
app.use('/api/progress', require('./modules/progress/progress.routes'));
app.use('/api/attendance', require('./modules/attendance/attendance.routes'));
app.use('/api/classes', require('./modules/classes/classes.routes'));
app.use('/api/bookings', require('./modules/bookings/bookings.routes'));
app.use('/api/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/calendar', require('./modules/calendar/calendar.routes'));
app.use('/api/reports', require('./modules/reports/reports.routes'));
app.use('/api/exercises', require('./modules/exercises/exercises.routes'));
app.use('/api/routine-requests', require('./modules/routineRequests/routineRequests.routes'));
app.use('/api/plans', require('./modules/plans/plans.routes'));
app.get('/api/public/plans', async (_req, res) => {
  try {
    const plans = await Plan.find({ activo: true }).sort({ precio: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener planes' });
  }
});

const { startScheduledChecks } = require('./services/servicioCron');
startScheduledChecks();

app.get('/', (req, res) => {
  res.json({ mensaje: 'API FitControl funcionando' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
