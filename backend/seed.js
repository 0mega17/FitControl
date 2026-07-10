const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Rol');
const User = require('./models/Usuario');
const Client = require('./models/Cliente');
const Trainer = require('./models/Entrenador');

dotenv.config();

/**
 * @description Script de seed: conecta a MongoDB, crea roles,
 *              usuario administrador, entrenador y cliente de prueba.
 * @returns {Promise<void>}
 */
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const roles = ['Administrador', 'Entrenador', 'Cliente'];
    const roleDocs = {};
    for (const nombre of roles) {
      const role = await Role.findOneAndUpdate(
        { nombre }, { nombre },
        { upsert: true, new: true }
      );
      roleDocs[nombre] = role;
    }
    console.log('Roles creados');

    const adminExists = await User.findOne({ email: 'admin@fitcontrol.com' });
    if (!adminExists) {
      const admin = await User.create({
        nombre: 'Admin',
        apellido: 'FitControl',
        email: 'admin@fitcontrol.com',
        password: 'admin123',
        rol: roleDocs['Administrador']._id
      });
      console.log('Admin creado: admin@fitcontrol.com / admin123');
    }

    const trainerExists = await User.findOne({ email: 'entrenador@fitcontrol.com' });
    if (!trainerExists) {
      const trainer = await User.create({
        nombre: 'Carlos',
        apellido: 'López',
        email: 'entrenador@fitcontrol.com',
        password: 'trainer123',
        rol: roleDocs['Entrenador']._id
      });
      await Trainer.create({
        usuario: trainer._id,
        especialidades: ['CrossFit', 'Funcional'],
        telefono: '+56 9 1111 1111'
      });
      console.log('Entrenador creado: entrenador@fitcontrol.com / trainer123');
    }

    const clientExists = await User.findOne({ email: 'cliente@fitcontrol.com' });
    if (!clientExists) {
      const client = await User.create({
        nombre: 'María',
        apellido: 'García',
        email: 'cliente@fitcontrol.com',
        password: 'cliente123',
        rol: roleDocs['Cliente']._id
      });
      await Client.create({
        usuario: client._id,
        telefono: '+56 9 2222 2222',
        fechaNacimiento: new Date('1995-05-15'),
        direccion: 'Av. Principal 123'
      });
      console.log('Cliente creado: cliente@fitcontrol.com / cliente123');
    }

    console.log('\nSeed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seed();
