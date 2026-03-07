const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Setting = sequelize.define('Setting', {
  id_config: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clave: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  valor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'configuraciones',
  underscored: true
});

module.exports = Setting;
