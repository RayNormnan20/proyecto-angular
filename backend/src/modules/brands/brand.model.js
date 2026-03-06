const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Brand = sequelize.define('Brand', {
  id_marca: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'marcas',
  underscored: true
});

module.exports = Brand;
