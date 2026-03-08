const { User, Role, Permission, Session, AccessLog } = require('../associations');
const { hashPassword, comparePassword } = require('../../utils/password.utils');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt.utils');
const { sendWelcomeEmail } = require('../../utils/email.utils');
const jwt = require('jsonwebtoken');

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
    apellidos: userData.apellidos,
    email: userData.email,
    password_hash: hashedPassword,
    telefono: userData.telefono,
    direccion: userData.direccion,
    rol_id: roleId,
    estado: 'activo'
  });

  // Enviar correo de bienvenida
  sendWelcomeEmail(user).catch(err => console.error('Error sending welcome email in background:', err));

  return { id: user.id_usuario, email: user.email, nombre: user.nombre };
};

const login = async (email, password, ipAddress = null, userAgent = null) => {
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

  // Log failed attempt if user exists but password/status fails could be done here, 
  // but simpler to just log successful logins for now or handle errors in controller.
  
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

  // 1. Log Access (LOGIN)
  try {
    await AccessLog.create({
      usuario_id: user.id_usuario,
      accion: 'LOGIN',
      ip_address: ipAddress,
      detalles: userAgent ? `User Agent: ${userAgent}` : 'No user agent provided'
    });
  } catch (logError) {
    console.error('Error creating access log:', logError);
    // Don't block login if logging fails
  }

  // 2. Create Session
  try {
    const decodedRefresh = jwt.decode(refreshToken);
    // exp is in seconds, convert to milliseconds
    const expiresAt = decodedRefresh && decodedRefresh.exp 
      ? new Date(decodedRefresh.exp * 1000) 
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Fallback 7 days

    await Session.create({
      usuario_id: user.id_usuario,
      refresh_token: refreshToken,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt
    });
    console.log(`✅ Sesión creada para usuario ${user.id_usuario}`);
  } catch (sessionError) {
    console.error('❌ Error creating session:', sessionError);
    // Don't block login if session creation fails, though refresh might fail later
  }

  return { 
    user: payload,
    accessToken,
    refreshToken
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  
  try {
    const session = await Session.findOne({ where: { refresh_token: refreshToken } });
    if (session) {
      session.is_revoked = true;
      await session.save();

      // Log Logout
      await AccessLog.create({
        usuario_id: session.usuario_id,
        accion: 'LOGOUT',
        detalles: 'Cierre de sesión exitoso'
      });
    }
  } catch (error) {
    console.error('Error in logout service:', error);
  }
};

const refreshToken = async (token) => {
  // Check revocation if session exists
  const session = await Session.findOne({ where: { refresh_token: token } });
  if (session && session.is_revoked) {
    throw new Error('Sesión revocada. Por favor inicie sesión nuevamente.');
  }

  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new Error('Refresh token inválido o expirado');

  const user = await User.findByPk(decoded.id, {
    include: [{ model: Role, as: 'role' }]
  });

  if (!user) throw new Error('Usuario no encontrado');

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

  const newAccessToken = generateToken(payload);
  
  return { accessToken: newAccessToken };
};

module.exports = { register, login, refreshToken, logout };
