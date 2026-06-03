const { sequelize } = require('../../config/database');
const { Order, OrderItem, Product, User, ProductImage, PaymentMethod, StockMovement, Coupon } = require('../associations');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../../utils/email.utils');
const { generateOrderPDF } = require('../../utils/pdf.utils');
const { ORDER_STATUS_VALUES } = require('./order.migration');
const { resolveValidCoupon } = require('../coupons/coupon.utils');

const { Op } = require('sequelize');

const ORDER_STATUS_SET = new Set(ORDER_STATUS_VALUES);
const STATUS_LABELS = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  en_preparacion: 'En preparación',
  listo_envio: 'Listo para envío',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  devuelto: 'Devuelto'
};
const ALLOWED_STATUS_TRANSITIONS = {
  pendiente: new Set(['pendiente', 'pagado', 'en_preparacion', 'cancelado']),
  pagado: new Set(['pagado', 'en_preparacion', 'listo_envio', 'cancelado']),
  en_preparacion: new Set(['en_preparacion', 'listo_envio', 'enviado', 'cancelado']),
  listo_envio: new Set(['listo_envio', 'enviado', 'cancelado']),
  enviado: new Set(['enviado', 'entregado', 'devuelto']),
  entregado: new Set(['entregado', 'devuelto']),
  cancelado: new Set(['cancelado']),
  devuelto: new Set(['devuelto'])
};

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

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).trim();
  return normalized || null;
};

const normalizeOptionalDate = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const isStatusTransitionAllowed = (currentStatus, nextStatus) => {
  const transitions = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!transitions) return false;
  return transitions.has(nextStatus);
};

const registerStockOutput = async ({ product, quantity, previousStock, orderId, transaction }) => {
  await StockMovement.create({
    producto_id: product.id_producto,
    tipo: 'salida',
    motivo: 'VENTA_PEDIDO',
    cantidad: quantity,
    stock_anterior: previousStock,
    stock_nuevo: product.stock,
    referencia_tipo: 'orden',
    referencia_id: orderId,
    nota: `Descuento automático por pedido #${orderId}`,
    usuario_id: null
  }, { transaction });
};

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { items, metodo_pago_id, direccion_envio, notas, codigo_operacion, cupon_codigo } = req.body;
    const userId = req.user.id; // From auth middleware

    // Parse items if it comes as a string (from FormData)
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        return res.status(400).json({ message: 'Formato de items inválido' });
      }
    }

    // Handle file upload
    let comprobantePath = null;
    if (req.file) {
      comprobantePath = req.file.path || (req.file.filename ? `/uploads/comprobantes/${req.file.filename}` : null);
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }

    // Validar método de pago
    if (!metodo_pago_id) {
      return res.status(400).json({ message: 'Debe seleccionar un método de pago' });
    }
    
    const paymentMethod = await PaymentMethod.findByPk(metodo_pago_id);
    if (!paymentMethod || !paymentMethod.activo) {
      return res.status(400).json({ message: 'Método de pago inválido o inactivo' });
    }

    let subtotal = 0;
    const orderItemsData = [];
    const stockChanges = [];

    // Validate products and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.id_producto, { transaction: t });
      
      if (!product) {
        const error = new Error(`Producto con ID ${item.id_producto} no encontrado`);
        error.statusCode = 404;
        throw error;
      }

      if (product.stock < item.cantidad) {
        const error = new Error(`Stock insuficiente para el producto ${product.nombre}`);
        error.statusCode = 400;
        throw error;
      }

      // Lógica de Precios por Volumen
      let precioAplicado = Number(product.precio);
      const preciosVolumen = parsePreciosVolumen(product.precios_volumen);
      if (preciosVolumen && Array.isArray(preciosVolumen)) {
        // Ordenar por cantidad mínima descendente para aplicar el descuento más alto que cumpla
        const escalas = [...preciosVolumen].sort((a, b) => b.min - a.min);
        const escalaEncontrada = escalas.find(e => item.cantidad >= e.min);
        if (escalaEncontrada) {
          precioAplicado = Number(escalaEncontrada.precio);
        }
      }

      const itemSubtotal = precioAplicado * item.cantidad;
      subtotal += itemSubtotal;

      orderItemsData.push({
        producto_id: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: precioAplicado,
        subtotal: itemSubtotal
      });

      // Decrement stock
      const previousStock = product.stock;
      product.stock -= item.cantidad;
      if (product.stock === 0) {
        product.estado = 'agotado';
      } else if (product.estado === 'agotado') {
        product.estado = 'activo';
      }
      await product.save({ transaction: t });
      stockChanges.push({
        product,
        quantity: item.cantidad,
        previousStock
      });
    }

    let couponId = null;
    let couponCode = null;
    let couponDiscount = 0;
    if (cupon_codigo) {
      const couponResult = await resolveValidCoupon({
        codigo: cupon_codigo,
        subtotal,
        transaction: t
      });

      if (couponResult.error) {
        const error = new Error(couponResult.error);
        error.statusCode = 400;
        throw error;
      }

      couponId = couponResult.coupon.id_cupon;
      couponCode = couponResult.codigo;
      couponDiscount = couponResult.discount;
      await couponResult.coupon.increment('usos_actuales', { by: 1, transaction: t });
    }

    const total = Number(Math.max(subtotal - couponDiscount, 0).toFixed(2));

    // Create Order
    const order = await Order.create({
      usuario_id: userId,
      total: total,
      estado: 'pendiente',
      metodo_pago_id: metodo_pago_id,
      cupon_id: couponId,
      cupon_codigo: couponCode,
      descuento_cupon: couponDiscount,
      direccion_envio: direccion_envio,
      notas: notas,
      codigo_operacion: codigo_operacion,
      comprobante_pago: comprobantePath
    }, { transaction: t });

    // Create Order Items
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        ...itemData,
        orden_id: order.id_orden
      }, { transaction: t });
    }

    for (const stockChange of stockChanges) {
      await registerStockOutput({
        ...stockChange,
        orderId: order.id_orden,
        transaction: t
      });
    }

    await t.commit();

    // Fetch created order with items
    const createdOrder = await Order.findByPk(order.id_orden, {
      include: [
        { 
          model: OrderItem, 
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'email']
        },
        {
          model: PaymentMethod,
          as: 'paymentMethod'
        },
        {
          model: Coupon,
          as: 'coupon'
        }
      ]
    });

    // Send confirmation email asynchronously
    if (createdOrder && createdOrder.user) {
      try {
        const pdfBuffer = await generateOrderPDF(createdOrder, createdOrder.items);
        sendOrderConfirmation(createdOrder, createdOrder.user, createdOrder.items, pdfBuffer)
          .catch(err => console.error('Error sending confirmation email:', err));
      } catch (pdfError) {
        console.error('Error generating PDF for email:', pdfError);
        // Fallback: send email without PDF
        sendOrderConfirmation(createdOrder, createdOrder.user, createdOrder.items)
          .catch(err => console.error('Error sending confirmation email fallback:', err));
      }
    }

    res.status(201).json(createdOrder);

  } catch (error) {
    await t.rollback();
    console.error('Error creating order:', error);
    res.status(error.statusCode || 500).json({ message: error.message || 'Error al crear la orden' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { page = 1, limit = 10, startDate, endDate, status, isProfile = false } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Si es una solicitud desde el perfil o no es un rol administrativo, solo mostrar sus propios pedidos
    if (String(isProfile) === 'true' || !['admin', 'trabajador', 'supervisor'].includes(role)) {
      whereClause.usuario_id = id;
    }

    // Date Filters
    if (startDate && endDate) {
      whereClause.fecha = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.fecha = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.fecha = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Status Filter
    if (status) {
      whereClause.estado = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'email']
        },
        { model: PaymentMethod, as: 'paymentMethod' },
        { model: Coupon, as: 'coupon' },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { 
              model: Product, 
              as: 'product',
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        }
      ],
      order: [['fecha', 'DESC']],
      distinct: true
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders: rows
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findByPk(id, {
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'email']
        },
        { model: PaymentMethod, as: 'paymentMethod' },
        { model: Coupon, as: 'coupon' },
        {
          model: OrderItem,
          as: 'items',
          include: [
            { 
              model: Product, 
              as: 'product',
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Check ownership
    if (!['admin', 'trabajador', 'supervisor'].includes(userRole) && order.usuario_id !== userId) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta orden' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error al obtener la orden' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado,
      empresa_envio,
      numero_seguimiento,
      url_seguimiento,
      fecha_preparacion,
      fecha_envio,
      fecha_entrega_estimada,
      fecha_entrega,
      nota_estado
    } = req.body;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'email']
        },
        { model: PaymentMethod, as: 'paymentMethod' },
        { model: Coupon, as: 'coupon' }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    const nextEstado = typeof estado === 'string' ? estado.trim() : '';
    if (!nextEstado || !ORDER_STATUS_SET.has(nextEstado)) {
      return res.status(400).json({ message: 'Estado de pedido inválido' });
    }
    if (!isStatusTransitionAllowed(order.estado, nextEstado)) {
      return res.status(400).json({
        message: `No se puede cambiar de ${STATUS_LABELS[order.estado] || order.estado} a ${STATUS_LABELS[nextEstado] || nextEstado}`
      });
    }

    const normalizedDates = {
      fecha_preparacion: normalizeOptionalDate(fecha_preparacion),
      fecha_envio: normalizeOptionalDate(fecha_envio),
      fecha_entrega_estimada: normalizeOptionalDate(fecha_entrega_estimada),
      fecha_entrega: normalizeOptionalDate(fecha_entrega)
    };

    if (Object.values(normalizedDates).some(value => value === null)) {
      return res.status(400).json({ message: 'Una o más fechas son inválidas' });
    }

    const statusChanged = order.estado !== nextEstado;
    const trackingChanged =
      (empresa_envio !== undefined && order.empresa_envio !== normalizeOptionalString(empresa_envio)) ||
      (numero_seguimiento !== undefined && order.numero_seguimiento !== normalizeOptionalString(numero_seguimiento)) ||
      (url_seguimiento !== undefined && order.url_seguimiento !== normalizeOptionalString(url_seguimiento)) ||
      (nota_estado !== undefined && order.nota_estado !== normalizeOptionalString(nota_estado)) ||
      (normalizedDates.fecha_preparacion !== undefined) ||
      (normalizedDates.fecha_envio !== undefined) ||
      (normalizedDates.fecha_entrega_estimada !== undefined) ||
      (normalizedDates.fecha_entrega !== undefined);

    order.estado = nextEstado;
    if (empresa_envio !== undefined) order.empresa_envio = normalizeOptionalString(empresa_envio);
    if (numero_seguimiento !== undefined) order.numero_seguimiento = normalizeOptionalString(numero_seguimiento);
    if (url_seguimiento !== undefined) order.url_seguimiento = normalizeOptionalString(url_seguimiento);
    if (nota_estado !== undefined) order.nota_estado = normalizeOptionalString(nota_estado);
    if (normalizedDates.fecha_preparacion !== undefined) order.fecha_preparacion = normalizedDates.fecha_preparacion;
    if (normalizedDates.fecha_envio !== undefined) order.fecha_envio = normalizedDates.fecha_envio;
    if (normalizedDates.fecha_entrega_estimada !== undefined) order.fecha_entrega_estimada = normalizedDates.fecha_entrega_estimada;
    if (normalizedDates.fecha_entrega !== undefined) order.fecha_entrega = normalizedDates.fecha_entrega;

    if (nextEstado === 'en_preparacion' && !order.fecha_preparacion) {
      order.fecha_preparacion = new Date();
    }
    if (nextEstado === 'enviado' && !order.fecha_envio) {
      order.fecha_envio = new Date();
    }
    if (nextEstado === 'entregado' && !order.fecha_entrega) {
      order.fecha_entrega = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'email']
        },
        { model: PaymentMethod, as: 'paymentMethod' },
        { model: Coupon, as: 'coupon' },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [{ model: ProductImage, as: 'images' }]
            }
          ]
        }
      ]
    });

    if ((statusChanged || trackingChanged) && updatedOrder?.user?.email) {
      sendOrderStatusUpdate(updatedOrder, updatedOrder.user)
        .catch(err => console.error('Error sending status update email:', err));
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message || 'Error al actualizar el estado de la orden' });
  }
};

const downloadOrderPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user' },
        { model: PaymentMethod, as: 'paymentMethod' },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Check permissions
    if (userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'trabajador' && order.usuario_id !== userId) {
      return res.status(403).json({ message: 'No tiene permiso para descargar este comprobante' });
    }

    const pdfBuffer = await generateOrderPDF(order, order.items);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Orden-${order.id_orden}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Error al generar el PDF' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  downloadOrderPDF
};
