const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
    
    // Sincronizar modelos (en producción usar migraciones)
    await sequelize.sync({ alter: true }); 
    console.log('✅ Modelos sincronizados con la base de datos.');

    // Sembrar configuraciones
    const seedSettings = require('../modules/settings/setting.seed');
    await seedSettings();
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
