const { Product, Category, Brand, ProductImage, StockMovement, User, ProductReview } = require('../associations');
const { Op, fn, col } = require('sequelize');

const MAX_BULK_IMPORT_ROWS = 500;

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

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeLookupKey = (value) => normalizeText(String(value ?? ''))
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const parseOptionalInteger = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isInteger(parsed) ? parsed : null;
};

const normalizeDecimal = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Number(value) : NaN;
  }

  const raw = normalizeText(String(value ?? ''));
  if (!raw) return NaN;

  let cleaned = raw
    .replace(/s\/\.?/gi, '')
    .replace(/\$/g, '')
    .replace(/\s+/g, '');

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasComma) {
    cleaned = cleaned.replace(',', '.');
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const normalized = normalizeLookupKey(value);
  if (['true', '1', 'si', 'sí', 'yes', 'visible', 'activo'].includes(normalized)) return true;
  if (['false', '0', 'no', 'oculto', 'inactivo'].includes(normalized)) return false;
  return defaultValue;
};

const normalizeStatusInput = (value) => {
  const normalized = normalizeLookupKey(value);
  if (!normalized) return 'activo';
  if (['activo', 'active'].includes(normalized)) return 'activo';
  if (['inactivo', 'inactive'].includes(normalized)) return 'inactivo';
  if (['agotado', 'sin stock', 'outofstock', 'out_of_stock'].includes(normalized)) return 'agotado';
  return null;
};

const sanitizeVolumePrices = (tiers) => {
  if (!Array.isArray(tiers)) return null;

  const normalized = tiers
    .map(tier => ({
      min: parseOptionalInteger(tier?.min),
      precio: normalizeDecimal(tier?.precio)
    }))
    .filter(tier => Number.isInteger(tier.min) && tier.min > 0 && Number.isFinite(tier.precio) && tier.precio >= 0)
    .sort((a, b) => a.min - b.min);

  return normalized.length > 0 ? normalized : null;
};

const parseVolumePricesForImport = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) return sanitizeVolumePrices(value);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('[')) {
      return sanitizeVolumePrices(parsePreciosVolumen(trimmed));
    }

    const tiers = trimmed
      .split('|')
      .map(chunk => chunk.trim())
      .filter(Boolean)
      .map(chunk => {
        const separator = chunk.includes(':') ? ':' : '=';
        const [min, precio] = chunk.split(separator);
        return { min, precio };
      });

    return sanitizeVolumePrices(tiers);
  }

  return null;
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
  usuario_id = null,
  transaction = undefined
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
  }, transaction ? { transaction } : undefined);
};

const getRowValue = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return undefined;
};

const buildLookupMaps = (items, idKey) => ({
  byId: new Map(items.map(item => [item[idKey], item])),
  byName: new Map(items.map(item => [normalizeLookupKey(item.nombre), item]))
});

const resolveLookupItem = ({ idValue, nameValue, lookup }) => {
  const id = parseOptionalInteger(idValue);
  if (id !== null) {
    return lookup.byId.get(id) || null;
  }

  const nameKey = normalizeLookupKey(nameValue);
  if (!nameKey) return null;
  return lookup.byName.get(nameKey) || null;
};

const registerLookupItem = ({ item, lookup, idKey }) => {
  lookup.byId.set(item[idKey], item);
  lookup.byName.set(normalizeLookupKey(item.nombre), item);
};

const registerProductItem = ({ item, productLookup }) => {
  productLookup.byId.set(item.id_producto, item);
  const skuKey = normalizeText(item.codigo_sku).toLowerCase();
  if (skuKey) {
    productLookup.bySku.set(skuKey, item);
  }
};

const unregisterProductSku = ({ sku, productLookup }) => {
  const skuKey = normalizeText(sku).toLowerCase();
  if (skuKey) {
    productLookup.bySku.delete(skuKey);
  }
};

const resolveOrCreateLookupItem = async ({
  idValue,
  nameValue,
  lookup,
  model,
  idKey,
  entityLabel,
  errors,
  transaction
}) => {
  const id = parseOptionalInteger(idValue);
  const normalizedName = normalizeText(nameValue);

  if (id !== null) {
    const foundById = lookup.byId.get(id);
    if (!foundById) {
      errors.push(`La ${entityLabel} con ID ${id} no existe.`);
      return null;
    }
    return { item: foundById, wasCreated: false };
  }

  if (!normalizedName) {
    errors.push(`La ${entityLabel} es obligatoria.`);
    return null;
  }

  const normalizedKey = normalizeLookupKey(normalizedName);
  const foundByName = lookup.byName.get(normalizedKey);
  if (foundByName) {
    return { item: foundByName, wasCreated: false };
  }

  const created = await model.create({
    nombre: normalizedName,
    estado: 'activo'
  }, { transaction });

  return {
    item: created,
    wasCreated: true,
    register() {
      registerLookupItem({ item: created, lookup, idKey });
    }
  };
};

const buildBulkImportPayload = async ({
  row,
  rowIndex,
  categoryLookup,
  brandLookup,
  productLookup,
  seenProductIds,
  seenSkus,
  transaction
}) => {
  const idProductoRaw = getRowValue(row, ['id_producto', 'producto_id']);
  const id_producto = parseOptionalInteger(idProductoRaw);
  const nombre = normalizeText(getRowValue(row, ['nombre', 'producto', 'product_name']));
  const descripcion = normalizeText(getRowValue(row, ['descripcion', 'descripción', 'detalle']));
  const codigo_sku = normalizeText(getRowValue(row, ['codigo_sku', 'sku', 'codigo', 'código']));
  const precioRaw = getRowValue(row, ['precio', 'precio_venta', 'price']);
  const stockRaw = getRowValue(row, ['stock', 'cantidad']);
  const estadoRaw = getRowValue(row, ['estado', 'status']);
  const visibleRaw = getRowValue(row, ['visible_web', 'visible', 'publicado']);
  const categoriaIdRaw = getRowValue(row, ['categoria_id', 'id_categoria']);
  const categoriaRaw = getRowValue(row, ['categoria', 'categoría', 'nombre_categoria']);
  const marcaIdRaw = getRowValue(row, ['marca_id', 'id_marca']);
  const marcaRaw = getRowValue(row, ['marca', 'brand', 'nombre_marca']);
  const volumenRaw = getRowValue(row, ['precios_volumen', 'precios_por_volumen', 'descuentos_volumen']);

  const errors = [];

  if (!nombre) {
    errors.push('El nombre es obligatorio.');
  }

  const precio = normalizeDecimal(precioRaw);
  if (!Number.isFinite(precio) || precio < 0) {
    errors.push('El precio debe ser un numero valido mayor o igual a 0.');
  }

  const stockCandidate = parseOptionalInteger(stockRaw);
  if (stockCandidate === null || stockCandidate < 0) {
    errors.push('El stock debe ser un numero entero mayor o igual a 0.');
  }
  const stock = stockCandidate ?? 0;
  const existingProductById = id_producto !== null ? (productLookup.byId.get(id_producto) || null) : null;
  const existingProductBySku = codigo_sku ? (productLookup.bySku.get(codigo_sku.toLowerCase()) || null) : null;

  if (id_producto !== null && !existingProductById) {
    errors.push(`El producto con ID ${id_producto} no existe.`);
  }

  if (existingProductById && existingProductBySku && existingProductById.id_producto !== existingProductBySku.id_producto) {
    errors.push('El ID del producto y el SKU pertenecen a productos diferentes.');
  }

  const targetProduct = existingProductById || existingProductBySku || null;

  if (targetProduct) {
    if (seenProductIds.has(targetProduct.id_producto)) {
      errors.push('Este producto ya aparece en otra fila del archivo.');
    }
  } else if (codigo_sku && seenSkus.has(codigo_sku.toLowerCase())) {
    errors.push('El SKU esta repetido dentro del archivo.');
  }

  const createdLookups = [];

  const categoryResult = await resolveOrCreateLookupItem({
    idValue: categoriaIdRaw,
    nameValue: categoriaRaw,
    lookup: categoryLookup,
    model: Category,
    idKey: 'id_categoria',
    entityLabel: 'categoria',
    errors,
    transaction
  });
  const category = categoryResult?.item || null;
  if (categoryResult?.wasCreated && categoryResult.register) {
    createdLookups.push(categoryResult.register);
  }

  const brandResult = await resolveOrCreateLookupItem({
    idValue: marcaIdRaw,
    nameValue: marcaRaw,
    lookup: brandLookup,
    model: Brand,
    idKey: 'id_marca',
    entityLabel: 'marca',
    errors,
    transaction
  });
  const brand = brandResult?.item || null;
  if (brandResult?.wasCreated && brandResult.register) {
    createdLookups.push(brandResult.register);
  }

  const estadoNormalizado = normalizeStatusInput(estadoRaw);
  if (estadoRaw !== undefined && !estadoNormalizado) {
    errors.push('El estado debe ser activo, inactivo o agotado.');
  }

  const precios_volumen = parseVolumePricesForImport(volumenRaw);
  if (volumenRaw !== undefined && volumenRaw !== null && volumenRaw !== '' && !precios_volumen) {
    errors.push('El formato de precios por volumen no es valido.');
  }

  if (errors.length > 0) {
    return {
      rowNumber: rowIndex + 2,
      nombre,
      codigo_sku,
      errors
    };
  }

  if (targetProduct) {
    seenProductIds.add(targetProduct.id_producto);
  } else if (codigo_sku) {
    seenSkus.add(codigo_sku.toLowerCase());
  }

  const nextSku = codigo_sku || targetProduct?.codigo_sku || null;
  const nextNombre = nombre || targetProduct?.nombre || '';
  const nextDescripcion = descripcion || targetProduct?.descripcion || '';
  const nextVisibleWeb = visibleRaw === undefined || visibleRaw === null || visibleRaw === ''
    ? (targetProduct?.visible_web ?? true)
    : normalizeBoolean(visibleRaw, true);
  const nextVolumePrices = precios_volumen !== null
    ? precios_volumen
    : (targetProduct?.precios_volumen ? sanitizeVolumePrices(parsePreciosVolumen(targetProduct.precios_volumen)) : null);

  return {
    rowNumber: rowIndex + 2,
    action: targetProduct ? 'update' : 'create',
    targetProduct,
    payload: {
      nombre: nextNombre,
      descripcion: nextDescripcion,
      precio,
      stock,
      categoria_id: category.id_categoria,
      marca_id: brand.id_marca,
      codigo_sku: nextSku,
      estado: resolveProductStatus(stock, estadoNormalizado || 'activo'),
      visible_web: nextVisibleWeb,
      precios_volumen: nextVolumePrices
    },
    finalizeLookups() {
      createdLookups.forEach(register => register());
    }
  };
};

const createProductRecord = async ({ payload, userId = null, files = [], transaction = undefined }) => {
  const product = await Product.create({
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    precio: payload.precio,
    stock: payload.stock,
    categoria_id: payload.categoria_id,
    marca_id: payload.marca_id,
    codigo_sku: payload.codigo_sku,
    estado: resolveProductStatus(payload.stock, payload.estado),
    visible_web: payload.visible_web,
    precios_volumen: payload.precios_volumen || null
  }, transaction ? { transaction } : undefined);

  if (Array.isArray(files) && files.length > 0) {
    const images = files.map(file => {
      const imageUrl = file.path && file.path.startsWith('http')
        ? file.path
        : `/uploads/products/${file.filename}`;

      return {
        producto_id: product.id_producto,
        url: imageUrl
      };
    });

    await ProductImage.bulkCreate(images, transaction ? { transaction } : undefined);
  }

  if (payload.stock > 0) {
    await createStockMovement({
      producto_id: product.id_producto,
      tipo: 'entrada',
      motivo: 'CREACION_PRODUCTO',
      cantidad: payload.stock,
      stock_anterior: 0,
      stock_nuevo: payload.stock,
      referencia_tipo: 'producto',
      referencia_id: product.id_producto,
      nota: 'Stock inicial del producto',
      usuario_id: userId,
      transaction
    });
  }

  return product;
};

const updateProductRecord = async ({ product, payload, userId = null, transaction = undefined }) => {
  const previousStock = product.stock;
  const previousSku = product.codigo_sku;
  const nextStock = normalizeStock(payload.stock);

  await product.update({
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    precio: payload.precio,
    stock: nextStock,
    categoria_id: payload.categoria_id,
    marca_id: payload.marca_id,
    codigo_sku: payload.codigo_sku,
    estado: resolveProductStatus(nextStock, payload.estado || product.estado),
    visible_web: payload.visible_web,
    precios_volumen: payload.precios_volumen || null
  }, transaction ? { transaction } : undefined);

  if (nextStock !== previousStock) {
    const diff = nextStock - previousStock;
    await createStockMovement({
      producto_id: product.id_producto,
      tipo: diff > 0 ? 'entrada' : 'ajuste',
      motivo: 'IMPORTACION_MASIVA',
      cantidad: Math.abs(diff),
      stock_anterior: previousStock,
      stock_nuevo: nextStock,
      referencia_tipo: 'importacion',
      referencia_id: product.id_producto,
      nota: 'Actualizacion desde importacion masiva',
      usuario_id: userId,
      transaction
    });
  }

  return {
    product,
    previousSku
  };
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
    
    const product = await createProductRecord({
      payload: {
        nombre,
        descripcion,
        precio,
        stock: normalizedStock,
        categoria_id,
        marca_id,
        codigo_sku,
        estado,
        visible_web,
        precios_volumen: sanitizeVolumePrices(parsePreciosVolumen(precios_volumen))
      },
      userId: req.user?.id || null,
      files: req.files
    });

    const createdProduct = await Product.findByPk(product.id_producto, {
      include: [{ model: ProductImage, as: 'images' }]
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

exports.bulkImport = async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.products) ? req.body.products : [];

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Debes enviar al menos un producto para importar.' });
    }

    if (rows.length > MAX_BULK_IMPORT_ROWS) {
      return res.status(400).json({ message: `Solo puedes importar hasta ${MAX_BULK_IMPORT_ROWS} productos por lote.` });
    }

    const [categories, brands] = await Promise.all([
      Category.findAll({ attributes: ['id_categoria', 'nombre'] }),
      Brand.findAll({ attributes: ['id_marca', 'nombre'] })
    ]);

    const categoryLookup = buildLookupMaps(categories, 'id_categoria');
    const brandLookup = buildLookupMaps(brands, 'id_marca');

    const incomingProductIds = rows
      .map(row => parseOptionalInteger(getRowValue(row || {}, ['id_producto', 'producto_id'])))
      .filter(id => id !== null);

    const incomingSkus = rows
      .map(row => normalizeText(getRowValue(row || {}, ['codigo_sku', 'sku', 'codigo', 'código'])).toLowerCase())
      .filter(Boolean);

    const existingProducts = incomingProductIds.length > 0 || incomingSkus.length > 0
      ? await Product.findAll({
          attributes: ['id_producto', 'nombre', 'descripcion', 'precio', 'stock', 'codigo_sku', 'estado', 'visible_web', 'categoria_id', 'marca_id', 'precios_volumen'],
          where: {
            [Op.or]: [
              incomingProductIds.length > 0 ? {
                id_producto: {
                  [Op.in]: incomingProductIds
                }
              } : null,
              incomingSkus.length > 0 ? {
                codigo_sku: {
                  [Op.in]: incomingSkus
                }
              } : null
            ].filter(Boolean)
          }
        })
      : [];

    const productLookup = {
      byId: new Map(),
      bySku: new Map()
    };
    existingProducts.forEach(product => registerProductItem({ item: product, productLookup }));
    const seenProductIds = new Set();
    const seenSkus = new Set();

    const result = {
      importedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      errorCount: 0,
      processedCount: rows.length,
      createdProducts: [],
      updatedProducts: [],
      errors: []
    };

    for (const [index, row] of rows.entries()) {
      const transaction = await Product.sequelize.transaction();

      const validationResult = await buildBulkImportPayload({
        row: row || {},
        rowIndex: index,
        categoryLookup,
        brandLookup,
        productLookup,
        seenProductIds,
        seenSkus,
        transaction
      });

      if (!validationResult.payload) {
        await transaction.rollback();
        result.errors.push(validationResult);
        continue;
      }

      try {
        let persistedProduct;
        let previousSku = null;

        if (validationResult.action === 'update' && validationResult.targetProduct) {
          const updated = await updateProductRecord({
            product: validationResult.targetProduct,
            payload: validationResult.payload,
            userId: req.user?.id || null,
            transaction
          });
          persistedProduct = updated.product;
          previousSku = updated.previousSku;
        } else {
          persistedProduct = await createProductRecord({
            payload: validationResult.payload,
            userId: req.user?.id || null,
            transaction
          });
        }

        await transaction.commit();
        validationResult.finalizeLookups?.();
        result.importedCount += 1;
        if (validationResult.action === 'update') {
          unregisterProductSku({ sku: previousSku, productLookup });
          registerProductItem({ item: persistedProduct, productLookup });
          result.updatedCount += 1;
          result.updatedProducts.push({
            id_producto: persistedProduct.id_producto,
            nombre: persistedProduct.nombre,
            codigo_sku: persistedProduct.codigo_sku,
            rowNumber: validationResult.rowNumber
          });
        } else {
          registerProductItem({ item: persistedProduct, productLookup });
          result.createdCount += 1;
          result.createdProducts.push({
            id_producto: persistedProduct.id_producto,
            nombre: persistedProduct.nombre,
            codigo_sku: persistedProduct.codigo_sku,
            rowNumber: validationResult.rowNumber
          });
        }
      } catch (error) {
        await transaction.rollback();
        result.errors.push({
          rowNumber: validationResult.rowNumber,
          nombre: validationResult.payload.nombre,
          codigo_sku: validationResult.payload.codigo_sku,
          errors: [error.message || (validationResult.action === 'update' ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.')]
        });
      }
    }

    result.errorCount = result.errors.length;

    if (result.importedCount === 0) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error al importar productos', error: error.message });
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
      payload.precios_volumen = sanitizeVolumePrices(parsePreciosVolumen(payload.precios_volumen));
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
