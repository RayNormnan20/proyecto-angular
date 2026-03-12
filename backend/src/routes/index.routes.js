const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const roleRoutes = require('../modules/roles/role.routes');
const permissionRoutes = require('../modules/permissions/permission.routes');
const categoryRoutes = require('../modules/categories/category.routes');
const brandRoutes = require('../modules/brands/brand.routes');
const productRoutes = require('../modules/products/product.routes');
const orderRoutes = require('../modules/orders/order.routes');
const settingRoutes = require('../modules/settings/setting.routes');
const favoriteRoutes = require('../modules/favorites/favorite.routes');
const paymentMethodRoutes = require('../modules/payment-methods/payment-method.routes');
const emailLogRoutes = require('../modules/email-logs/email-log.routes');
const testimonialRoutes = require('../modules/testimonials/testimonial.routes');
const contactRoutes = require('../modules/contact/contact.routes');
const homeBannerRoutes = require('../modules/home-banners/home-banner.routes');
const { User, Role, Order, Product } = require('../modules/associations');
const { Op } = require('sequelize');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/settings', settingRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/email-logs', emailLogRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/contact', contactRoutes);
router.use('/home-banners', homeBannerRoutes);


// Ejemplo de ruta protegida para verificar el token
const verifyToken = require('../middlewares/auth.middleware');
const checkRole = require('../middlewares/role.middleware');
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso autorizado', user: req.user });
});

router.get('/stats', verifyToken, checkRole(['admin', 'trabajador', 'supervisor']), async (req, res) => {
  try {
    const [usersActive, usersTotal, productsTotal] = await Promise.all([
      User.count({ where: { estado: 'activo' } }),
      User.count(),
      Product.count()
    ]);

    const [ordersTotal, ordersPending, revenueTotal] = await Promise.all([
      Order.count(),
      Order.count({ where: { estado: 'pendiente' } }),
      Order.sum('total', { where: { estado: { [Op.in]: ['pagado', 'enviado', 'entregado'] } } })
    ]);

    const recentOrders = await Order.findAll({
      limit: 6,
      order: [['fecha', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id_usuario', 'nombre', 'apellidos', 'email']
        }
      ]
    });

    const recentUsers = await User.findAll({
      limit: 6,
      order: [['createdAt', 'DESC']],
      attributes: ['id_usuario', 'nombre', 'apellidos', 'email', 'estado', 'createdAt'],
      include: [{ model: Role, as: 'role', attributes: ['id_rol', 'nombre'] }]
    });

    res.json({
      users: {
        active: usersActive,
        total: usersTotal
      },
      products: {
        total: productsTotal
      },
      orders: {
        total: ordersTotal,
        pending: ordersPending
      },
      revenue: {
        total: Number(revenueTotal || 0)
      },
      recentOrders: recentOrders.map(o => ({
        id_orden: o.id_orden,
        fecha: o.fecha,
        estado: o.estado,
        total: Number(o.total || 0),
        user: o.user ? {
          id_usuario: o.user.id_usuario,
          nombre: o.user.nombre,
          apellidos: o.user.apellidos,
          email: o.user.email
        } : null
      })),
      recentUsers: recentUsers.map(u => ({
        id_usuario: u.id_usuario,
        nombre: u.nombre,
        apellidos: u.apellidos,
        email: u.email,
        estado: u.estado,
        created_at: u.createdAt,
        role: u.role ? { id_rol: u.role.id_rol, nombre: u.role.nombre } : null
      }))
    });
  } catch (error) {
    console.error('Error building stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
