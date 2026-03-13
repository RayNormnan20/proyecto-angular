const { sequelize } = require('../../config/database');
const { Order, OrderItem, Product, User, ProductImage, PaymentMethod } = require('../associations');
const { sendOrderConfirmation } = require('../../utils/email.utils');
const { generateOrderPDF } = require('../../utils/pdf.utils');

const { Op } = require('sequelize');

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { items, metodo_pago_id, direccion_envio, notas, codigo_operacion } = req.body;
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

    let total = 0;
    const orderItemsData = [];

    // Validate products and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.id_producto, { transaction: t });
      
      if (!product) {
        throw new Error(`Producto con ID ${item.id_producto} no encontrado`);
      }

      if (product.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para el producto ${product.nombre}`);
      }

      // Lógica de Precios por Volumen
      let precioAplicado = Number(product.precio);
      if (product.precios_volumen && Array.isArray(product.precios_volumen)) {
        // Ordenar por cantidad mínima descendente para aplicar el descuento más alto que cumpla
        const escalas = [...product.precios_volumen].sort((a, b) => b.min - a.min);
        const escalaEncontrada = escalas.find(e => item.cantidad >= e.min);
        if (escalaEncontrada) {
          precioAplicado = Number(escalaEncontrada.precio);
        }
      }

      const subtotal = precioAplicado * item.cantidad;
      total += subtotal;

      orderItemsData.push({
        producto_id: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: precioAplicado,
        subtotal: subtotal
      });

      // Decrement stock
      product.stock -= item.cantidad;
      if (product.stock === 0) {
        product.estado = 'agotado';
      }
      await product.save({ transaction: t });
    }

    // Create Order
    const order = await Order.create({
      usuario_id: userId,
      total: total,
      estado: 'pendiente',
      metodo_pago_id: metodo_pago_id,
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
    res.status(500).json({ message: error.message || 'Error al crear la orden' });
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
    const { estado } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    order.estado = estado;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la orden' });
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
