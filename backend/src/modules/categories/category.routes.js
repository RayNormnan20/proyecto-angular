const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');
const upload = require('../../middlewares/upload.middleware')('categories');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', upload.single('image'), categoryController.create);
router.put('/:id', upload.single('image'), categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
