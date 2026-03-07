const Role = require('./role.model');
const User = require('../users/user.model');
const Permission = require('../permissions/permission.model');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id_usuario'] // Just to count
        },
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ]
    });

    // Map to include user count and simplify structure
    const rolesWithCount = roles.map(role => ({
      id_rol: role.id_rol,
      nombre: role.nombre,
      descripcion: role.descripcion,
      usersCount: role.users ? role.users.length : 0,
      active: true, // Assuming roles are active by default for now
      permissions: role.permissions || []
    }));

    res.json(rolesWithCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { nombre, descripcion, permissions } = req.body;

    const existingRole = await Role.findOne({ where: { nombre } });
    if (existingRole) {
      return res.status(400).json({ message: 'El rol ya existe' });
    }

    const newRole = await Role.create({
      nombre,
      descripcion
    });

    if (permissions && Array.isArray(permissions)) {
      await newRole.setPermissions(permissions);
    }

    // Fetch again to include permissions in response
    const roleWithPermissions = await Role.findByPk(newRole.id_rol, {
        include: [{ model: Permission, as: 'permissions' }]
    });

    res.status(201).json({ message: 'Rol creado exitosamente', role: roleWithPermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear rol' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Check if role has users assigned before deleting
    const usersCount = await User.count({ where: { rol_id: id } });
    if (usersCount > 0) {
        return res.status(400).json({ message: 'No se puede eliminar un rol que tiene usuarios asignados' });
    }

    await role.destroy();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar rol' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permissions } = req.body;
    
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    await role.update({ nombre, descripcion });

    if (permissions && Array.isArray(permissions)) {
      await role.setPermissions(permissions);
    }

    // Fetch again to include permissions
    const updatedRole = await Role.findByPk(id, {
        include: [{ model: Permission, as: 'permissions' }]
    });

    res.json({ message: 'Rol actualizado correctamente', role: updatedRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};
