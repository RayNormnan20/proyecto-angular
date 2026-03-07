const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Session = sequelize.define('Session', {
  id_sesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.STRING(255)
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'sesiones',
  timestamps: true,
  underscored: true
});

module.exports = Session;
