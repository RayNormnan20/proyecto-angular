const Testimonial = require('./testimonial.model');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../../config/cloudinary');

exports.getAll = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const where = {};
    
    if (activeOnly === 'true') {
      where.activo = true;
    }
    
    const testimonials = await Testimonial.findAll({ 
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.json(testimonials);
  } catch (error) {
    console.error('Error al obtener testimonios:', error);
    res.status(500).json({ message: 'Error al obtener testimonios', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonio no encontrado' });
    }
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener testimonio', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { mensaje, activo } = req.body;
    let imagen_url = '';
    
    if (req.file) {
      // Si se usó Cloudinary, req.file.path tiene la URL
      if (req.file.path && req.file.path.startsWith('http')) {
        imagen_url = req.file.path;
      } else {
        // Fallback local
        imagen_url = `/uploads/testimonials/${req.file.filename}`;
      }
    }
    
    if (!imagen_url) {
      return res.status(400).json({ message: 'La imagen es obligatoria' });
    }
    
    const testimonial = await Testimonial.create({
      mensaje,
      imagen_url,
      activo: activo === 'true' || activo === true
    });
    
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Error al crear testimonio:', error);
    res.status(500).json({ message: 'Error al crear testimonio', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { mensaje, activo } = req.body;
    
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonio no encontrado' });
    }
    
    const updates = {};
    if (mensaje !== undefined) updates.mensaje = mensaje;
    if (activo !== undefined) updates.activo = activo;
    
    if (req.file) {
      // Eliminar imagen anterior si es local
      if (testimonial.imagen_url && !testimonial.imagen_url.startsWith('http')) {
        const oldPath = path.join(__dirname, '../../../public', testimonial.imagen_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      // Si se usó Cloudinary, req.file.path tiene la URL
      if (req.file.path && req.file.path.startsWith('http')) {
        updates.imagen_url = req.file.path;
      } else {
        updates.imagen_url = `/uploads/testimonials/${req.file.filename}`;
      }
    }
    
    await testimonial.update(updates);
    
    res.json(testimonial);
  } catch (error) {
    console.error('Error al actualizar testimonio:', error);
    res.status(500).json({ message: 'Error al actualizar testimonio', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByPk(id);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonio no encontrado' });
    }
    
    // Eliminar imagen si es local
    if (testimonial.imagen_url && !testimonial.imagen_url.startsWith('http')) {
      const imagePath = path.join(__dirname, '../../../public', testimonial.imagen_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // TODO: Eliminar imagen de Cloudinary si aplica (requiere public_id)
    
    await testimonial.destroy();
    res.json({ message: 'Testimonio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar testimonio', error: error.message });
  }
};
