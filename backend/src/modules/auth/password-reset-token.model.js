const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id_token: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  token_hash: {
    type: DataTypes.STRING(128),
    allowNull: false,
    unique: true
  },
  requested_ip: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
  underscored: true
});

module.exports = PasswordResetToken;
