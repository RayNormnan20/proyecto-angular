const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const User = require('../users/user.model');

const Order = sequelize.define('Order', {
  id_orden: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id_usuario'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  metodo_pago: {
    type: DataTypes.ENUM('yape', 'transferencia'),
    allowNull: false
  },
  codigo_operacion: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Código de operación de la transferencia o yape'
  },
  comprobante_pago: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Ruta o URL del comprobante de pago (QR/Voucher)'
  },
  direccion_envio: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ordenes',
  underscored: true
});

module.exports = Order;
