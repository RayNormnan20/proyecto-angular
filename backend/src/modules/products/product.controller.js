const { Product, Category, Brand, ProductImage, StockMovement, User, ProductReview } = require('../associations');
const { Op, fn, col } = require('sequelize');

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

const normalizeStock = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

const resolveProductStatus = (stock, currentStatus) => {
  if (stock <= 0) return 'agotado';
  if (currentStatus === 'agotado') return 'activo';
  return currentStatus || 'activo';
};

const createStockMovement = async ({
  producto_id,
  tipo,
  motivo,
  cantidad,
  stock_anterior,
  stock_nuevo,
  referencia_tipo = null,
  referencia_id = null,
  nota = null,
  usuario_id = null
}) => {
  if (!cantidad) return;

  await StockMovement.create({
    producto_id,
    tipo,
    motivo,
    cantidad,
    stock_anterior,
    stock_nuevo,
    referencia_tipo,
    referencia_id,
    nota,
    usuario_id
  });
};

const attachReviewSummaryToProducts = async (products) => {
  if (!Array.isArray(products) || products.length === 0) return;

  const productIds = products
    .map(product => product.id_producto)
    .filter(id => Number.isInteger(id));

  if (productIds.length === 0) return;

  const reviewRows = await ProductReview.findAll({
    attributes: [
      'producto_id',
      [fn('AVG', col('puntuacion')), 'average'],
      [fn('COUNT', col('id_resena')), 'total']
    ],
    where: {
      visible: true,
      producto_id: {
        [Op.in]: productIds
      }
    },
    group: ['producto_id'],
    raw: true
  });

  const summaryMap = new Map(
    reviewRows.map(row => [
      Number(row.producto_id),
      {
        average: Number(Number(row.average || 0).toFixed(1)),
        total: Number(row.total || 0)
      }
    ])
  );

  for (const product of products) {
    product.setDataValue('review_summary', summaryMap.get(product.id_producto) || {
      average: 0,
      total: 0
    });
  }
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
    await attachReviewSummaryToProducts(rows);

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
    await attachReviewSummaryToProducts([product]);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria_id, marca_id, codigo_sku, estado, visible_web, precios_volumen } = req.body;
    const normalizedStock = normalizeStock(stock);
    
    const product = await Product.create({
      nombre, 
      descripcion, 
      precio, 
      stock: normalizedStock, 
      categoria_id, 
      marca_id, 
      codigo_sku, 
      estado: resolveProductStatus(normalizedStock, estado), 
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

    if (normalizedStock > 0) {
      await createStockMovement({
        producto_id: product.id_producto,
        tipo: 'entrada',
        motivo: 'CREACION_PRODUCTO',
        cantidad: normalizedStock,
        stock_anterior: 0,
        stock_nuevo: normalizedStock,
        referencia_tipo: 'producto',
        referencia_id: product.id_producto,
        nota: 'Stock inicial del producto',
        usuario_id: req.user?.id || null
      });
    }

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
    const previousStock = product.stock;
    let nextStock = previousStock;

    if (Object.prototype.hasOwnProperty.call(payload, 'stock')) {
      nextStock = normalizeStock(payload.stock);
      payload.stock = nextStock;
      payload.estado = resolveProductStatus(nextStock, payload.estado || product.estado);
    }

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

    if (nextStock !== previousStock) {
      const diff = nextStock - previousStock;
      await createStockMovement({
        producto_id: product.id_producto,
        tipo: diff > 0 ? 'entrada' : 'ajuste',
        motivo: 'EDICION_PRODUCTO',
        cantidad: Math.abs(diff),
        stock_anterior: previousStock,
        stock_nuevo: nextStock,
        referencia_tipo: 'producto',
        referencia_id: product.id_producto,
        nota: 'Cambio de stock desde edición del producto',
        usuario_id: req.user?.id || null
      });
    }

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
};

exports.getStockMovements = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const movements = await StockMovement.findAll({
      where: { producto_id: product.id_producto },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id_usuario', 'nombre', 'apellidos', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos de stock', error: error.message });
  }
};

exports.adjustStock = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const adjustmentType = String(req.body.adjustmentType || '').trim();
    const quantity = normalizeStock(req.body.quantity);
    const note = typeof req.body.note === 'string' ? req.body.note.trim() : '';

    if (!['add', 'remove', 'set'].includes(adjustmentType)) {
      return res.status(400).json({ message: 'Tipo de ajuste inválido' });
    }

    if (adjustmentType !== 'set' && quantity <= 0) {
      return res.status(400).json({ message: 'La cantidad del ajuste debe ser mayor a cero' });
    }

    const previousStock = product.stock;
    let nextStock = previousStock;
    let movementType = 'ajuste';
    let reason = 'AJUSTE_MANUAL';

    if (adjustmentType === 'add') {
      nextStock = previousStock + quantity;
      movementType = 'entrada';
      reason = 'INGRESO_MANUAL';
    } else if (adjustmentType === 'remove') {
      if (quantity > previousStock) {
        return res.status(400).json({ message: 'No puedes retirar más stock del disponible' });
      }
      nextStock = previousStock - quantity;
      movementType = 'salida';
      reason = 'SALIDA_MANUAL';
    } else {
      nextStock = quantity;
      movementType = nextStock >= previousStock ? 'entrada' : 'ajuste';
      reason = 'AJUSTE_ABSOLUTO';
    }

    product.stock = nextStock;
    product.estado = resolveProductStatus(nextStock, product.estado);
    await product.save();

    await createStockMovement({
      producto_id: product.id_producto,
      tipo: movementType,
      motivo: reason,
      cantidad: Math.abs(nextStock - previousStock),
      stock_anterior: previousStock,
      stock_nuevo: nextStock,
      referencia_tipo: 'manual',
      referencia_id: product.id_producto,
      nota: note || null,
      usuario_id: req.user?.id || null
    });

    const updatedProduct = await Product.findByPk(product.id_producto, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al ajustar stock', error: error.message });
  }
};
