const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Product = require('./product.model');

const ProductImage = sequelize.define('ProductImage', {
  id_imagen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id_producto'
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'producto_imagenes',
  underscored: true,
  timestamps: true, // created_at y updated_at
  updatedAt: false  // solo necesitamos created_at realmente, pero por defecto sequelize pone ambos. Dejaré created_at.
});

module.exports = ProductImage;
