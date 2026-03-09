const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const upload = require('../../middlewares/upload.middleware')('products');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rutas protegidas
router.post('/', [authenticateToken, checkPermission('CREAR_PRODUCTO'), upload.array('images', 5)], productController.create);
router.put('/:id', [authenticateToken, checkPermission('EDITAR_PRODUCTO'), upload.array('images', 5)], productController.update);
router.delete('/:id', [authenticateToken, checkPermission('ELIMINAR_PRODUCTO')], productController.delete);
router.delete('/images/:imageId', [authenticateToken, checkPermission('EDITAR_PRODUCTO')], productController.deleteImage);

module.exports = router;
