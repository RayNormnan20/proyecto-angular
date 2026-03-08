const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const EmailLog = sequelize.define('EmailLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  destinatario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asunto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('enviado', 'fallido'),
    defaultValue: 'enviado'
  },
  error_mensaje: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha_envio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  tipo: {
    type: DataTypes.ENUM('orden', 'bienvenida', 'test', 'otro'),
    defaultValue: 'otro'
  },
  referencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de la orden o usuario relacionado'
  }
}, {
  tableName: 'email_logs',
  underscored: true,
  timestamps: false // We use fecha_envio as createdAt
});

module.exports = EmailLog;
