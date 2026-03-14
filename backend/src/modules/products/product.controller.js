const { Product, Category, Brand, ProductImage } = require('../associations');
const { Op } = require('sequelize');

const parsePreciosVolumen = (value) => {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
};

// Listar productos con filtros y paginación
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, brand, minPrice, maxPrice, sort } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    let order = [['created_at', 'DESC']]; // Default sort

    if (sort === 'oldest') {
      order = [['created_at', 'ASC']];
    } else if (sort === 'price_asc') {
      order = [['precio', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['precio', 'DESC']];
    }
    
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } },
        { descripcion: { [Op.like]: `%${search}%` } },
        { codigo_sku: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (category) where.categoria_id = category;
    if (brand) where.marca_id = brand;
    if (minPrice) where.precio = { [Op.gte]: minPrice };
    if (maxPrice) where.precio = { ...where.precio, [Op.lte]: maxPrice };

    // Si es cliente público (no admin), filtrar por estado activo y visible_web
    // Esto se podría manejar mejor con roles, por ahora asumimos que si no hay token o rol admin, es público
    // Pero como estamos en el controller genérico, podemos añadir un query param `public=true` o manejarlo por middleware
    // Dejaré que el frontend envíe los filtros necesarios o crearé un endpoint específico para publico.
    
    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      attributes: {
        include: ['precios_volumen']
      },
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductImage, as: 'images' }
      ],
      distinct: true // Para contar correctamente con includes
    });

    for (const product of rows) {
      product.setDataValue('precios_volumen', parsePreciosVolumen(product.precios_volumen));
    }

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      products: rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductImage, as: 'images' }
      ]
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    product.setDataValue('precios_volumen', parsePreciosVolumen(product.precios_volumen));
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria_id, marca_id, codigo_sku, estado, visible_web, precios_volumen } = req.body;
    
    const product = await Product.create({
      nombre, 
      descripcion, 
      precio, 
      stock, 
      categoria_id, 
      marca_id, 
      codigo_sku, 
      estado, 
      visible_web,
      precios_volumen: parsePreciosVolumen(precios_volumen)
    });

    // Manejar imágenes subidas
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => {
        let imageUrl;
        if (file.path && file.path.startsWith('http')) {
          imageUrl = file.path;
        } else {
          imageUrl = `/uploads/products/${file.filename}`;
        }
        return {
          producto_id: product.id_producto,
          url: imageUrl
        };
      });
      await ProductImage.bulkCreate(images);
    }

    const createdProduct = await Product.findByPk(product.id_producto, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const payload = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(payload, 'precios_volumen')) {
      payload.precios_volumen = parsePreciosVolumen(payload.precios_volumen);
    }
    await product.update(payload);

    // Si se suben nuevas imágenes, se agregan a las existentes
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => {
        let imageUrl;
        if (file.path && file.path.startsWith('http')) {
          imageUrl = file.path;
        } else {
          imageUrl = `/uploads/products/${file.filename}`;
        }
        return {
          producto_id: product.id_producto,
          url: imageUrl
        };
      });
      await ProductImage.bulkCreate(images);
    }

    // Nota: Para eliminar imágenes específicas, se debería crear otro endpoint o lógica adicional
    
    const updatedProduct = await Product.findByPk(product.id_producto, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    
    await product.destroy();
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

exports.deleteImage = async (req, res) => {
    try {
        const image = await ProductImage.findByPk(req.params.imageId);
        if(!image) return res.status(404).json({ message: 'Imagen no encontrada'});
        
        // Opcional: Eliminar archivo físico
        // const fs = require('fs');
        // const path = require('path');
        // const filePath = path.join(__dirname, '../../public', image.url);
        // if(fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await image.destroy();
        res.json({ message: 'Imagen eliminada'});
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
    }
}
