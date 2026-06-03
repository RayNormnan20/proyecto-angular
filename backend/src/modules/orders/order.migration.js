const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ORDER_STATUS_VALUES = [
  'pendiente',
  'pagado',
  'en_preparacion',
  'listo_envio',
  'enviado',
  'entregado',
  'cancelado',
  'devuelto'
];

const ensureOrderTrackingColumns = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const table = await queryInterface.describeTable('ordenes');
    const columnsToAdd = {
      empresa_envio: {
        type: DataTypes.STRING,
        allowNull: true
      },
      numero_seguimiento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url_seguimiento: {
        type: DataTypes.STRING,
        allowNull: true
      },
      fecha_preparacion: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_envio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_entrega_estimada: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_entrega: {
        type: DataTypes.DATE,
        allowNull: true
      },
      nota_estado: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    };

    for (const [columnName, definition] of Object.entries(columnsToAdd)) {
      if (!table[columnName]) {
        await queryInterface.addColumn('ordenes', columnName, definition);
      }
    }

    await queryInterface.changeColumn('ordenes', 'estado', {
      type: DataTypes.ENUM(...ORDER_STATUS_VALUES),
      allowNull: false,
      defaultValue: 'pendiente'
    });

    console.log('✅ Columnas de tracking de pedidos verificadas.');
  } catch (error) {
    console.error('❌ Error al verificar columnas de tracking de pedidos:', error);
  }
};

module.exports = { ensureOrderTrackingColumns, ORDER_STATUS_VALUES };
