const { User, Role, Permission, Session, AccessLog, PasswordResetToken } = require('../associations');
const { hashPassword, comparePassword } = require('../../utils/password.utils');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt.utils');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../../utils/email.utils');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const logAccessEvent = async ({ usuarioId = null, accion, ipAddress = null, detalles = null }) => {
  try {
    await AccessLog.create({
      usuario_id: usuarioId,
      accion,
      ip_address: ipAddress,
      detalles
    });
  } catch (logError) {
    console.error('Error creating access log:', logError);
  }
};

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

    // Si aún no existe, crear el rol por defecto
    if (!role) {
      role = await Role.create({
        nombre: 'usuario',
        descripcion: 'Rol por defecto para nuevos usuarios'
      });
    }

    if (role) {
      roleId = role.id_rol;
    } else {
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
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ 
    where: { email: normalizedEmail },
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

  if (!user) {
    await logAccessEvent({
      accion: 'FAILED_LOGIN',
      ipAddress,
      detalles: `Intento de acceso para correo no registrado: ${normalizedEmail}`
    });
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    await logAccessEvent({
      usuarioId: user.id_usuario,
      accion: 'FAILED_LOGIN',
      ipAddress,
      detalles: userAgent ? `Contraseña incorrecta. User Agent: ${userAgent}` : 'Contraseña incorrecta'
    });
    throw new Error('Credenciales inválidas');
  }

  if (user.estado !== 'activo') {
    await logAccessEvent({
      usuarioId: user.id_usuario,
      accion: 'FAILED_LOGIN',
      ipAddress,
      detalles: `Cuenta con estado ${user.estado}`
    });
    throw new Error('Su cuenta no está activa. Contacte al administrador.');
  }

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

  await logAccessEvent({
    usuarioId: user.id_usuario,
    accion: 'LOGIN',
    ipAddress,
    detalles: userAgent ? `User Agent: ${userAgent}` : 'No user agent provided'
  });

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

      await logAccessEvent({
        usuarioId: session.usuario_id,
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
    include: [{ 
      model: Role, 
      as: 'role',
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    }]
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

const requestPasswordReset = async (email, ipAddress = null, userAgent = null) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ where: { email: normalizedEmail } });

  await logAccessEvent({
    usuarioId: user ? user.id_usuario : null,
    accion: 'PASSWORD_RESET_REQUEST',
    ipAddress,
    detalles: user
      ? (userAgent ? `Solicitud de recuperación. User Agent: ${userAgent}` : 'Solicitud de recuperación')
      : `Solicitud para correo no registrado: ${normalizedEmail}`
  });

  if (!user || user.estado !== 'activo') {
    return;
  }

  const now = new Date();
  await PasswordResetToken.update(
    { used_at: now },
    {
      where: {
        usuario_id: user.id_usuario,
        used_at: null,
        expires_at: { [Op.gt]: now }
      }
    }
  );

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await PasswordResetToken.create({
    usuario_id: user.id_usuario,
    token_hash: tokenHash,
    requested_ip: ipAddress,
    user_agent: userAgent,
    expires_at: expiresAt
  });

  await sendPasswordResetEmail(user, rawToken);
};

const resetPassword = async (token, newPassword, ipAddress = null, userAgent = null) => {
  const passwordStr = String(newPassword || '').trim();
  const tokenHash = hashResetToken(String(token || '').trim());
  const now = new Date();

  const resetToken = await PasswordResetToken.findOne({
    where: {
      token_hash: tokenHash,
      used_at: null,
      expires_at: { [Op.gt]: now }
    },
    include: [{ model: User, as: 'user' }]
  });

  if (!resetToken || !resetToken.user) {
    await logAccessEvent({
      accion: 'PASSWORD_RESET_FAILED',
      ipAddress,
      detalles: userAgent ? `Token inválido o expirado. User Agent: ${userAgent}` : 'Token inválido o expirado'
    });
    throw new Error('El enlace de recuperación es inválido o ya expiró');
  }

  resetToken.user.password_hash = await hashPassword(passwordStr);
  await resetToken.user.save();

  resetToken.used_at = now;
  await resetToken.save();

  await Session.update(
    { is_revoked: true },
    { where: { usuario_id: resetToken.user.id_usuario, is_revoked: false } }
  );

  await PasswordResetToken.update(
    { used_at: now },
    {
      where: {
        usuario_id: resetToken.user.id_usuario,
        used_at: null,
        expires_at: { [Op.gt]: now },
        id_token: { [Op.ne]: resetToken.id_token }
      }
    }
  );

  await logAccessEvent({
    usuarioId: resetToken.user.id_usuario,
    accion: 'PASSWORD_RESET_SUCCESS',
    ipAddress,
    detalles: userAgent ? `Contraseña restablecida. User Agent: ${userAgent}` : 'Contraseña restablecida'
  });

  return { message: 'Contraseña restablecida correctamente' };
};

module.exports = { register, login, refreshToken, logout, requestPasswordReset, resetPassword };
