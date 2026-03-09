const express = require('express');
const router = express.Router();
const controller = require('./payment-method.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const upload = require('../../middlewares/upload.middleware')('payments');

// Public routes (users need to see payment methods)
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Protected routes
router.post('/', [authenticateToken, checkPermission('GESTIONAR_METODOS_PAGO')], controller.create);
router.put('/:id', [authenticateToken, checkPermission('GESTIONAR_METODOS_PAGO')], controller.update);
router.post('/:id/image', [authenticateToken, checkPermission('GESTIONAR_METODOS_PAGO'), upload.single('image')], controller.uploadImage);
router.delete('/:id', [authenticateToken, checkPermission('ELIMINAR_METODO_PAGO')], controller.delete);

module.exports = router;
