const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const upload = require('../../middlewares/upload.middleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rutas protegidas (deberían tener middleware de auth y rol, pero por ahora las dejo abiertas o agrego comentario)
// upload.array('images', 5) permite subir hasta 5 imágenes con el campo 'images'
router.post('/', upload.array('images', 5), productController.create);
router.put('/:id', upload.array('images', 5), productController.update);
router.delete('/:id', productController.delete);
router.delete('/images/:imageId', productController.deleteImage);

module.exports = router;
