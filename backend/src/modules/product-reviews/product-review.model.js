const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ProductReview = sequelize.define('ProductReview', {
  id_resena: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orden_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  puntuacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  visible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'resenas_productos',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['producto_id', 'usuario_id']
    }
  ]
});

module.exports = ProductReview;
