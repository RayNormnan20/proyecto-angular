const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

const createUploadMiddleware = require('../../middlewares/upload.middleware');
const upload = createUploadMiddleware('comprobantes');

// Public routes (authenticated users)
router.post('/', authenticateToken, upload.single('comprobante_pago'), orderController.createOrder);
router.get('/', authenticateToken, orderController.getOrders); // Logic inside controller filters by ownership
router.get('/:id/pdf', authenticateToken, orderController.downloadOrderPDF);
router.get('/:id', authenticateToken, orderController.getOrderById);

// Admin/Staff routes
router.put('/:id/status', authenticateToken, checkPermission('GESTIONAR_PEDIDOS'), orderController.updateOrderStatus);

module.exports = router;
