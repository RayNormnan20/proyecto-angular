const { Role, Permission } = require('../modules/associations');

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      // Admin always has access (optional, but good safeguard)
      if (req.user.role === 'admin') {
        return next();
      }

      const userRoleName = req.user.role;
      
      const role = await Role.findOne({
        where: { nombre: userRoleName },
        include: [{
          model: Permission,
          as: 'permissions',
          where: { nombre: requiredPermission },
          required: true // Inner join - only returns if permission exists
        }]
      });

      if (!role) {
        return res.status(403).json({ 
          message: `Acceso denegado. Se requiere el permiso: ${requiredPermission}` 
        });
      }

      next();
    } catch (error) {
      console.error('Error checking permission:', error);
      return res.status(500).json({ message: 'Error interno al verificar permisos' });
    }
  };
};

module.exports = checkPermission;
