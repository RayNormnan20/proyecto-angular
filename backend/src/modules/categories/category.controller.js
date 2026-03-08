const Category = require('./category.model');

// Obtener todas las categorías
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id_categoria', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

// Obtener una categoría por ID
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categoría', error: error.message });
  }
};

// Crear categoría
exports.create = async (req, res) => {
  try {
    const categoryData = {
      ...req.body
    };

    console.log('Creating category with data:', req.body);
    console.log('File:', req.file);

    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        categoryData.imagen = req.file.path;
      } else {
        // Guardar ruta relativa
        categoryData.imagen = `/uploads/categories/${req.file.filename}`;
      }
    }

    const category = await Category.create(categoryData);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
};

// Actualizar categoría
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    
    const categoryData = {
      ...req.body
    };

    console.log('Updating category:', req.params.id);
    console.log('Update data:', req.body);
    console.log('File:', req.file);

    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        categoryData.imagen = req.file.path;
      } else {
        categoryData.imagen = `/uploads/categories/${req.file.filename}`;
      }
    }

    await category.update(categoryData);
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
  }
};

// Eliminar categoría
exports.delete = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    
    // Soft delete o hard delete según preferencia, aquí haré cambio de estado a inactivo
    // O eliminación física si no hay restricción
    // Si se desea eliminación física:
    await category.destroy();
    // Si se desea lógico: await category.update({ estado: 'inactivo' });
    
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar categoría', error: error.message });
  }
};
