const User = require('./user.model');
const Role = require('../roles/role.model');
const { hashPassword } = require('../../utils/password.utils');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id_usuario', 'nombre', 'apellidos', 'email', 'telefono', 'direccion', 'estado', 'created_at', 'rol_id'],
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id_rol', 'nombre']
      }]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nombre, apellidos, email, password, telefono, direccion, rol_id, estado } = req.body;
    const nombreStr = typeof nombre === 'string' ? nombre.trim() : '';
    const apellidosStr = typeof apellidos === 'string' ? apellidos.trim() : '';
    const emailStr = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const passwordStr = typeof password === 'string' ? password.trim() : '';

    if (!nombreStr || !apellidosStr || !emailStr || !passwordStr) {
      return res.status(400).json({
        message: 'Nombre, apellidos, correo y contraseña son obligatorios'
      });
    }

    const existingUser = await User.findOne({ where: { email: emailStr } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = await hashPassword(passwordStr);

    const newUser = await User.create({
      nombre: nombreStr,
      apellidos: apellidosStr,
      email: emailStr,
      password_hash: hashedPassword,
      telefono,
      direccion,
      rol_id: rol_id || null, // Optional role
      estado: estado || 'activo'
    });

    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, email, telefono, direccion, estado, rol_id, password } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const payload = { nombre, apellidos, email, telefono, direccion, estado, rol_id };
    const passwordStr = typeof password === 'string' ? password.trim() : '';
    if (passwordStr) {
      payload.password_hash = await hashPassword(passwordStr);
    }

    await user.update(payload);
    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};
