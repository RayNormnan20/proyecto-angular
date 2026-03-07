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

// Ejemplo de ruta protegida para verificar el token
const verifyToken = require('../middlewares/auth.middleware');
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso autorizado', user: req.user });
});

module.exports = router;
