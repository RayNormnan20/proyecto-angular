const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

// Public routes (authenticated users)
router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getOrders); // Logic inside controller filters by ownership
router.get('/:id', authenticateToken, orderController.getOrderById);

// Admin/Staff routes
router.put('/:id/status', authenticateToken, checkPermission('GESTIONAR_PEDIDOS'), orderController.updateOrderStatus);

module.exports = router;
