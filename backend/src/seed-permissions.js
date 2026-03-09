const { Role, Permission, User } = require('./modules/associations');
const { sequelize } = require('./config/database');

const seedPermissions = async () => {
  try {
    await sequelize.authenticate();
    
    // Drop permission tables to ensure clean slate (avoids migration issues in dev)
    await sequelize.getQueryInterface().dropTable('role_permissions');
    await sequelize.getQueryInterface().dropTable('roles_permisos'); // Potential default name
    await sequelize.getQueryInterface().dropTable('permisos');

    // await sequelize.sync({ alter: true }); // Ensure tables exist and match models
    await Permission.sync({ force: true });
    await Role.sync(); 
    // Sync the through table
    if (sequelize.models.role_permissions) {
      await sequelize.models.role_permissions.sync({ force: true });
    }

    // 0. Ensure Roles Exist
    const roles = ['admin', 'trabajador', 'supervisor', 'usuario'];
    for (const roleName of roles) {
        await Role.findOrCreate({
            where: { nombre: roleName },
            defaults: { nombre: roleName, descripcion: `Rol de ${roleName}` }
        });
    }

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
      // Productos
      { nombre: 'VER_PRODUCTOS', descripcion: 'Puede ver la lista de productos' },
      { nombre: 'CREAR_PRODUCTO', descripcion: 'Puede crear nuevos productos' },
      { nombre: 'EDITAR_PRODUCTO', descripcion: 'Puede editar productos existentes' },
      { nombre: 'ELIMINAR_PRODUCTO', descripcion: 'Puede eliminar productos' },
      // Categorías
      { nombre: 'VER_CATEGORIAS', descripcion: 'Puede ver la lista de categorías' },
      { nombre: 'CREAR_CATEGORIA', descripcion: 'Puede crear nuevas categorías' },
      { nombre: 'EDITAR_CATEGORIA', descripcion: 'Puede editar categorías existentes' },
      { nombre: 'ELIMINAR_CATEGORIA', descripcion: 'Puede eliminar categorías' },
      // Marcas
      { nombre: 'VER_MARCAS', descripcion: 'Puede ver la lista de marcas' },
      { nombre: 'CREAR_MARCA', descripcion: 'Puede crear nuevas marcas' },
      { nombre: 'EDITAR_MARCA', descripcion: 'Puede editar marcas existentes' },
      { nombre: 'ELIMINAR_MARCA', descripcion: 'Puede eliminar marcas' },
      // Pedidos
      { nombre: 'VER_PEDIDOS', descripcion: 'Puede ver la lista de pedidos' },
      { nombre: 'GESTIONAR_PEDIDOS', descripcion: 'Puede cambiar estado de pedidos' },
      // Configuración
      { nombre: 'VER_CONFIGURACION', descripcion: 'Puede ver configuraciones del sistema' },
      { nombre: 'GESTIONAR_CONFIGURACION', descripcion: 'Puede modificar configuraciones' },
      // Envíos
      { nombre: 'VER_ENVIOS', descripcion: 'Puede ver la lista de costos de envío' },
      { nombre: 'CREAR_ENVIO', descripcion: 'Puede agregar nuevos costos de envío' },
      { nombre: 'EDITAR_ENVIO', descripcion: 'Puede editar costos de envío' },
      { nombre: 'ELIMINAR_ENVIO', descripcion: 'Puede eliminar costos de envío' },
      // Testimonios
      { nombre: 'VER_TESTIMONIOS', descripcion: 'Puede ver la lista de testimonios' },
      { nombre: 'GESTIONAR_TESTIMONIOS', descripcion: 'Puede aprobar o editar testimonios' },
      { nombre: 'ELIMINAR_TESTIMONIO', descripcion: 'Puede eliminar testimonios' },
      // Logs de Email
      { nombre: 'VER_LOGS_EMAIL', descripcion: 'Puede ver el historial de correos enviados' },
      // Métodos de Pago
      { nombre: 'VER_METODOS_PAGO', descripcion: 'Puede ver métodos de pago configurados' },
      { nombre: 'GESTIONAR_METODOS_PAGO', descripcion: 'Puede agregar o editar métodos de pago' },
      { nombre: 'ELIMINAR_METODO_PAGO', descripcion: 'Puede eliminar métodos de pago' },
      // Dashboard
      { nombre: 'VER_DASHBOARD', descripcion: 'Puede ver el panel principal y estadísticas' },
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
                nombre: ['VER_USUARIOS', 'VER_ROLES', 'VER_PRODUCTOS', 'VER_CATEGORIAS', 'VER_MARCAS', 'VER_PEDIDOS']
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
                 nombre: [
                    'VER_USUARIOS', 'VER_ROLES', 'EDITAR_USUARIO', 'EDITAR_ROL', 'CREAR_USUARIO', 'CREAR_ROL',
                    'VER_PRODUCTOS', 'CREAR_PRODUCTO', 'EDITAR_PRODUCTO',
                    'VER_CATEGORIAS', 'CREAR_CATEGORIA', 'EDITAR_CATEGORIA',
                    'VER_MARCAS', 'CREAR_MARCA', 'EDITAR_MARCA',
                    'VER_PEDIDOS', 'GESTIONAR_PEDIDOS',
                    'VER_ENVIOS', 'CREAR_ENVIO', 'EDITAR_ENVIO',
                    'VER_CONFIGURACION',
                    'VER_TESTIMONIOS', 'GESTIONAR_TESTIMONIOS',
                    'VER_LOGS_EMAIL',
                    'VER_METODOS_PAGO', 'GESTIONAR_METODOS_PAGO',
                    'VER_DASHBOARD'
                ]
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
