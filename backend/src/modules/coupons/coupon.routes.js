const express = require('express');
const router = express.Router();
const couponController = require('./coupon.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

router.post('/validate', authenticateToken, couponController.validateCoupon);
router.get('/', authenticateToken, checkPermission('VER_CUPONES'), couponController.getCoupons);
router.post('/', authenticateToken, checkPermission('GESTIONAR_CUPONES'), couponController.createCoupon);
router.put('/:id', authenticateToken, checkPermission('GESTIONAR_CUPONES'), couponController.updateCoupon);
router.delete('/:id', authenticateToken, checkPermission('ELIMINAR_CUPON'), couponController.deleteCoupon);

module.exports = router;
