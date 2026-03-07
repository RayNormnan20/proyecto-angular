const { sequelize } = require('./config/database');
const PaymentMethod = require('./modules/payment-methods/payment-method.model');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync only this model to ensure table exists
    await PaymentMethod.sync({ alter: true });
    console.log('PaymentMethod model synced');

    const methods = [
      {
        nombre: 'Transferencia Bancaria',
        descripcion: 'Transferencia directa a nuestra cuenta BCP',
        instrucciones: 'BCP: 191-12345678-0-01\nCCI: 002-191-12345678001-59\nTitular: Nova Vam 3D SAC',
        requiere_comprobante: true
      },
      {
        nombre: 'Yape / Plin',
        descripcion: 'Escanea el QR o usa el número',
        instrucciones: 'Número: 999 999 999\nTitular: Nova Vam 3D',
        requiere_comprobante: true
      },
      {
        nombre: 'Contra Entrega',
        descripcion: 'Paga en efectivo al recibir',
        instrucciones: 'Ten el monto exacto por favor.',
        requiere_comprobante: false
      }
    ];

    for (const m of methods) {
      const [method, created] = await PaymentMethod.findOrCreate({
        where: { nombre: m.nombre },
        defaults: m
      });
      if (created) console.log(`Created: ${m.nombre}`);
      else console.log(`Exists: ${m.nombre}`);
    }

    console.log('Payment methods seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding payment methods:', error);
    process.exit(1);
  }
}

seed();
