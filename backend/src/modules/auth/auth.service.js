const { User, Role, Permission } = require('../associations');
const { hashPassword, comparePassword } = require('../../utils/password.utils');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt.utils');

const register = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) {
    throw new Error('El usuario ya existe con ese correo electrónico');
  }

  const hashedPassword = await hashPassword(userData.password);

  // Asignar rol por defecto 'usuario' si no se especifica
  let roleId = userData.rol_id;
  if (!roleId) {
     // Buscar rol 'usuario'
     let role = await Role.findOne({ where: { nombre: 'usuario' } });
     
     // Si no existe 'usuario', intentar con 'cliente'
     if (!role) {
        role = await Role.findOne({ where: { nombre: 'cliente' } });
     }

     if (role) {
        roleId = role.id_rol;
     } else {
        // Fallback final: Si no hay roles de usuario/cliente, lanzar error o asignar el rol con ID más alto (menos privilegios usualmente)
        // Por seguridad, NO asignar 'trabajador' ni 'admin'
        throw new Error('Error interno: No se pudo asignar un rol al usuario. Contacte al administrador.');
     }
  }

  const user = await User.create({
    nombre: userData.nombre,
    email: userData.email,
    password_hash: hashedPassword,
    rol_id: roleId,
    estado: 'activo'
  });

  return { id: user.id_usuario, email: user.email, nombre: user.nombre };
};

const login = async (email, password) => {
  const user = await User.findOne({ 
    where: { email },
    include: [{ 
      model: Role, 
      as: 'role',
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] } // Don't include join table attributes
      }]
    }]
  });

  if (!user) throw new Error('Credenciales inválidas');

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) throw new Error('Credenciales inválidas');

  if (user.estado !== 'activo') throw new Error('Su cuenta no está activa. Contacte al administrador.');

  user.ultimo_acceso = new Date();
  await user.save();

  // Extract permission names
  const permissions = user.role && user.role.permissions 
    ? user.role.permissions.map(p => p.nombre) 
    : [];

  const payload = { 
    id: user.id_usuario, 
    nombre: user.nombre,
    email: user.email, 
    role: user.role ? user.role.nombre : 'user',
    permissions: permissions
  };

  const accessToken = generateToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { 
    user: payload,
    accessToken,
    refreshToken
  };
};

const refreshToken = async (token) => {
  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new Error('Refresh token inválido o expirado');

  const user = await User.findByPk(decoded.id, {
    include: [{ model: Role, as: 'role' }]
  });

  if (!user) throw new Error('Usuario no encontrado');

  const payload = { 
    id: user.id_usuario, 
    nombre: user.nombre,
    email: user.email, 
    role: user.role ? user.role.nombre : 'user' 
  };

  const newAccessToken = generateToken(payload);
  
  return { accessToken: newAccessToken };
};

module.exports = { register, login, refreshToken };
