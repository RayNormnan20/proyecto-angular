const Role = require('./roles/role.model');
const User = require('./users/user.model');
const Permission = require('./permissions/permission.model');

// Role-Permission associations (Many-to-Many)
Role.belongsToMany(Permission, { 
  through: 'role_permissions', 
  foreignKey: 'role_id', 
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, { 
  through: 'role_permissions', 
  foreignKey: 'permission_id', 
  otherKey: 'role_id',
  as: 'roles'
});

module.exports = { User, Role, Permission };
