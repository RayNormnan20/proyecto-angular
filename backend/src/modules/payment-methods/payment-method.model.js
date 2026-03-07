const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PaymentMethod = sequelize.define('PaymentMethod', {
  id_metodo_pago: {
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
    type: DataTypes.STRING,
    allowNull: true
  },
  instrucciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Instrucciones para el usuario (e.g. número de cuenta, yape)'
  },
  imagen_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  requiere_comprobante: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'metodos_pago',
  underscored: true,
  timestamps: true
});

module.exports = PaymentMethod;
