const authService = require('./auth.service');
const User = require('../users/user.model');
const Role = require('../roles/role.model');
const Permission = require('../permissions/permission.model');
const { hashPassword } = require('../../utils/password.utils');

const register = async (req, res) => {
  try {
    // Basic validation
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const user = await authService.register(req.body);
    res.status(201).json({ message: 'Usuario registrado exitosamente', user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }
    
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: error.message || 'Credenciales inválidas' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh Token requerido' });
    
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [{ 
        model: Role, 
        as: 'role',
        include: [{
          model: Permission, // Permission is not imported here, need to check imports
          as: 'permissions',
          through: { attributes: [] }
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Extract permission names
    const permissions = user.role && user.role.permissions 
      ? user.role.permissions.map(p => p.nombre) 
      : [];

    const userData = {
      id: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      role: user.role ? user.role.nombre : 'user',
      permissions: permissions
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

const logout = (req, res) => {
  // En una implementación más robusta, invalidaríamos el refresh token en la DB
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = { register, login, refreshToken, logout, getProfile };
