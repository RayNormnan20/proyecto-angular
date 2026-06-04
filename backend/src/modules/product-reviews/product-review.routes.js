const express = require('express');
const router = express.Router();
const productReviewController = require('./product-review.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

router.get('/', authenticateToken, checkPermission('VER_RESENAS_PRODUCTOS'), productReviewController.getAdminReviews);
router.get('/product/:productId', productReviewController.getProductReviews);
router.get('/product/:productId/me', authenticateToken, productReviewController.getMyReviewStatus);
router.post('/', authenticateToken, productReviewController.createReview);
router.patch('/:id/visibility', authenticateToken, checkPermission('GESTIONAR_RESENAS_PRODUCTOS'), productReviewController.updateReviewVisibility);
router.put('/:id', authenticateToken, productReviewController.updateReview);
router.delete('/:id', authenticateToken, productReviewController.deleteReview);
router.delete('/:id/admin', authenticateToken, checkPermission('ELIMINAR_RESENA_PRODUCTO'), productReviewController.deleteAdminReview);

module.exports = router;
