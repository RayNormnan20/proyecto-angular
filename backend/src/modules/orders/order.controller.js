const { sequelize } = require('../../config/database');
const { Order, OrderItem, Product, User, ProductImage } = require('../associations');

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, metodo_pago, direccion_envio, notas, codigo_operacion } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
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

      const subtotal = Number(product.precio) * item.cantidad;
      total += subtotal;

      orderItemsData.push({
        producto_id: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: product.precio,
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
      metodo_pago: metodo_pago,
      direccion_envio: direccion_envio,
      notas: notas,
      codigo_operacion: codigo_operacion
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
        }
      ]
    });

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
    const whereClause = {};

    // If not admin/staff, only show own orders
    if (!['admin', 'trabajador', 'supervisor'].includes(role)) {
      whereClause.usuario_id = id;
    }

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'email']
        },
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
      order: [['fecha', 'DESC']]
    });

    res.json(orders);
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

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
