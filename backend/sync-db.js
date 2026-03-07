const { sequelize } = require('./src/config/database');
const Order = require('./src/modules/orders/order.model');
const PaymentMethod = require('./src/modules/payment-methods/payment-method.model');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Sync PaymentMethod first
    await PaymentMethod.sync({ alter: true });
    console.log('PaymentMethod synced.');

    // Sync Order to add new column
    await Order.sync({ alter: true });
    console.log('Order synced (added metodo_pago_id).');

    process.exit(0);
  } catch (error) {
    console.error('Error syncing DB:', error);
    process.exit(1);
  }
}

sync();
