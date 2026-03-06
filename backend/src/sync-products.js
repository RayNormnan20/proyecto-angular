const { sequelize } = require('./config/database');
const { Product, Category, Brand, ProductImage } = require('./modules/associations');

const sync = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');
    
    // Sincronizar modelos
    console.log('🔄 Sincronizando tablas de productos...');
    await Category.sync({ alter: true });
    await Brand.sync({ alter: true });
    await Product.sync({ alter: true });
    await ProductImage.sync({ alter: true });
    
    console.log('✅ Tablas sincronizadas correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al sincronizar:', error);
    process.exit(1);
  }
};

sync();
