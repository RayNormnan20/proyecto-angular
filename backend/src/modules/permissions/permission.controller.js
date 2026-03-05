const Permission = require('./permission.model');

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener permisos' });
  }
};
