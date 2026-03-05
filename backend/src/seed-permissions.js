const { Role, Permission, User } = require('./modules/associations');
const { sequelize } = require('./config/database');

const seedPermissions = async () => {
  try {
    await sequelize.authenticate();
    
    // Drop permission tables to ensure clean slate (avoids migration issues in dev)
    await sequelize.getQueryInterface().dropTable('role_permissions');
    await sequelize.getQueryInterface().dropTable('roles_permisos'); // Potential default name
    await sequelize.getQueryInterface().dropTable('permisos');

    await sequelize.sync({ alter: true }); // Ensure tables exist and match models

    // 1. Create permissions
    const permissions = [
      { nombre: 'VER_USUARIOS', descripcion: 'Puede ver la lista de usuarios' },
      { nombre: 'CREAR_USUARIO', descripcion: 'Puede crear nuevos usuarios' },
      { nombre: 'EDITAR_USUARIO', descripcion: 'Puede editar usuarios existentes' },
      { nombre: 'ELIMINAR_USUARIO', descripcion: 'Puede eliminar usuarios' },
      { nombre: 'VER_ROLES', descripcion: 'Puede ver la lista de roles' },
      { nombre: 'CREAR_ROL', descripcion: 'Puede crear nuevos roles' },
      { nombre: 'EDITAR_ROL', descripcion: 'Puede editar roles existentes' },
      { nombre: 'ELIMINAR_ROL', descripcion: 'Puede eliminar roles' },
    ];

    for (const perm of permissions) {
      await Permission.findOrCreate({
        where: { nombre: perm.nombre },
        defaults: perm
      });
    }

    // 2. Assign all permissions to 'admin'
    const adminRole = await Role.findOne({ where: { nombre: 'admin' } });
    if (adminRole) {
      const allPermissions = await Permission.findAll();
      await adminRole.setPermissions(allPermissions);
      console.log('✅ Permisos asignados al rol admin');
    }

    // 3. Assign limited permissions to 'trabajador' (only read)
    const workerRole = await Role.findOne({ where: { nombre: 'trabajador' } });
    if (workerRole) {
        const readPermissions = await Permission.findAll({
            where: {
                nombre: ['VER_USUARIOS', 'VER_ROLES']
            }
        });
        await workerRole.setPermissions(readPermissions);
        console.log('✅ Permisos de lectura asignados al rol trabajador');
    }

     // 4. Assign limited permissions to 'supervisor' (read + edit but no delete)
     const supervisorRole = await Role.findOne({ where: { nombre: 'supervisor' } });
     if (supervisorRole) {
         const supervisorPermissions = await Permission.findAll({
             where: {
                 nombre: ['VER_USUARIOS', 'VER_ROLES', 'EDITAR_USUARIO', 'EDITAR_ROL', 'CREAR_USUARIO', 'CREAR_ROL']
             }
         });
         await supervisorRole.setPermissions(supervisorPermissions);
         console.log('✅ Permisos de supervisor asignados (sin eliminar)');
     }

    console.log('✅ Inicialización de permisos completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar permisos:', error);
    process.exit(1);
  }
};

seedPermissions();
