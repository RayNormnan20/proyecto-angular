const HomeBanner = require('./home-banner.model');
const fs = require('fs');
const path = require('path');

const toBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
};

const normalizeSortOrder = (value) => {
  if (value === undefined || value === null || value === '') return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

exports.getAll = async (req, res) => {
  try {
    const { activeOnly, placement } = req.query;
    const where = {};

    if (activeOnly === 'true') {
      where.activo = true;
    }

    if (placement) {
      where.placement = placement;
    }

    const banners = await HomeBanner.findAll({
      where,
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    res.json(banners);
  } catch (error) {
    console.error('Error al obtener banners:', error);
    res.status(500).json({ message: 'Error al obtener banners', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { placement, title, description, button_text, button_link, activo, sort_order } = req.body;

    if (!placement) {
      return res.status(400).json({ message: 'El campo placement es obligatorio' });
    }

    let image_url = '';
    if (req.file) {
      if (req.file.path && req.file.path.startsWith('http')) {
        image_url = req.file.path;
      } else {
        image_url = `/uploads/banners/${req.file.filename}`;
      }
    }

    if (!image_url) {
      return res.status(400).json({ message: 'La imagen es obligatoria' });
    }

    const banner = await HomeBanner.create({
      placement,
      title: title || null,
      description: description || null,
      button_text: button_text || null,
      button_link: button_link || null,
      image_url,
      activo: toBoolean(activo, true),
      sort_order: normalizeSortOrder(sort_order)
    });

    res.status(201).json(banner);
  } catch (error) {
    console.error('Error al crear banner:', error);
    res.status(500).json({ message: 'Error al crear banner', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { placement, title, description, button_text, button_link, activo, sort_order } = req.body;

    const banner = await HomeBanner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    const updates = {};
    if (placement !== undefined) updates.placement = placement;
    if (title !== undefined) updates.title = title || null;
    if (description !== undefined) updates.description = description || null;
    if (button_text !== undefined) updates.button_text = button_text || null;
    if (button_link !== undefined) updates.button_link = button_link || null;
    if (activo !== undefined) updates.activo = toBoolean(activo, banner.activo);
    if (sort_order !== undefined) updates.sort_order = normalizeSortOrder(sort_order);

    if (req.file) {
      if (banner.image_url && !banner.image_url.startsWith('http')) {
        const oldPath = path.join(__dirname, '../../../public', banner.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      if (req.file.path && req.file.path.startsWith('http')) {
        updates.image_url = req.file.path;
      } else {
        updates.image_url = `/uploads/banners/${req.file.filename}`;
      }
    }

    await banner.update(updates);
    res.json(banner);
  } catch (error) {
    console.error('Error al actualizar banner:', error);
    res.status(500).json({ message: 'Error al actualizar banner', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await HomeBanner.findByPk(id);

    if (!banner) {
      return res.status(404).json({ message: 'Banner no encontrado' });
    }

    if (banner.image_url && !banner.image_url.startsWith('http')) {
      const imagePath = path.join(__dirname, '../../../public', banner.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await banner.destroy();
    res.json({ message: 'Banner eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar banner:', error);
    res.status(500).json({ message: 'Error al eliminar banner', error: error.message });
  }
};
