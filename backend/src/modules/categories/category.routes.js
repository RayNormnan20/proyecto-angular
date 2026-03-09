const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const upload = require('../../middlewares/upload.middleware')('categories');
const authenticateToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

// Rutas protegidas
router.post('/', [authenticateToken, checkPermission('CREAR_CATEGORIA'), upload.single('image')], categoryController.create);
router.put('/:id', [authenticateToken, checkPermission('EDITAR_CATEGORIA'), upload.single('image')], categoryController.update);
router.delete('/:id', [authenticateToken, checkPermission('ELIMINAR_CATEGORIA')], categoryController.delete);

module.exports = router;
