const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AccessLog = sequelize.define('AccessLog', {
  id_log: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  accion: {
    type: DataTypes.STRING(50),
    allowNull: false // LOGIN, LOGOUT, FAILED_LOGIN
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  detalles: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'logs_acceso',
  timestamps: true,
  underscored: true
});

module.exports = AccessLog;
