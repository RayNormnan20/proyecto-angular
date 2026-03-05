const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const Role = require('../roles/role.model');

const User = sequelize.define('User', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id_rol'
    }
  },
  estado: {
    type: DataTypes.ENUM('activo', 'suspendido', 'inactivo'),
    defaultValue: 'activo'
  },
  ultimo_acceso: DataTypes.DATE
}, {
  tableName: 'usuarios',
  underscored: true
});

User.belongsTo(Role, { foreignKey: 'rol_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'rol_id' });

module.exports = User;
