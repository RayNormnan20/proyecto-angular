const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Category = require('../categories/category.model');
const Brand = require('../brands/brand.model');

const Product = sequelize.define('Product', {
  id_producto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  codigo_sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'agotado'),
    defaultValue: 'activo'
  },
  visible_web: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Determina si el producto es visible en la web pública'
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id_categoria'
    }
  },
  marca_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Brand,
      key: 'id_marca'
    }
  },
  precios_volumen: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON con estructura [{"min": 10, "precio": 0.80}, ...]'
  }
}, {
  tableName: 'productos',
  underscored: true
});

module.exports = Product;
