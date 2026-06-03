const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Coupon = sequelize.define('Coupon', {
  id_cupon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_descuento: {
    type: DataTypes.ENUM('porcentaje', 'monto_fijo'),
    allowNull: false,
    defaultValue: 'porcentaje'
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  monto_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  max_usos: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usos_actuales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'cupones',
  underscored: true
});

module.exports = Coupon;
