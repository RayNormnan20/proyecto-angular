const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ensureProductReviewColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const table = await queryInterface.describeTable('resenas_productos');

    if (!table.visible) {
      await queryInterface.addColumn('resenas_productos', 'visible', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      });
    }

    console.log('✅ Columnas de reseñas de productos verificadas.');
  } catch (error) {
    console.error('❌ Error al verificar columnas de reseñas de productos:', error);
  }
};

module.exports = { ensureProductReviewColumns };
