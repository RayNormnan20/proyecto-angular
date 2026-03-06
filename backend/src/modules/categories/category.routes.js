const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
// Asumimos que existen middlewares de auth, los agregaremos luego si es necesario
// const { authenticate, authorize } = require('../../middlewares/auth.middleware');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
