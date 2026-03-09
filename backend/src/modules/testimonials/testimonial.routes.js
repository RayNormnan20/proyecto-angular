const express = require('express');
const router = express.Router();
const testimonialController = require('./testimonial.controller');
const createUploadMiddleware = require('../../middlewares/upload.middleware');
const verifyToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');

// Public routes
router.get('/', testimonialController.getAll);

// Protected routes
router.post('/', [verifyToken, checkPermission('GESTIONAR_TESTIMONIOS'), createUploadMiddleware('testimonials').single('image')], testimonialController.create);
router.put('/:id', [verifyToken, checkPermission('GESTIONAR_TESTIMONIOS'), createUploadMiddleware('testimonials').single('image')], testimonialController.update);
router.delete('/:id', [verifyToken, checkPermission('ELIMINAR_TESTIMONIO')], testimonialController.delete);

module.exports = router;
