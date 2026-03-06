const Brand = require('./brand.model');

exports.getAll = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener marcas', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener marca', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear marca', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Marca no encontrada' });
    
    await brand.update(req.body);
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar marca', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Marca no encontrada' });
    
    await brand.destroy();
    res.json({ message: 'Marca eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar marca', error: error.message });
  }
};
