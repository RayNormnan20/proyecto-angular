const express = require('express');
const router = express.Router();
const testimonialController = require('./testimonial.controller');
const createUploadMiddleware = require('../../middlewares/upload.middleware');
const verifyToken = require('../../middlewares/auth.middleware');
const checkRole = require('../../middlewares/role.middleware');

// Public routes
router.get('/', testimonialController.getAll);

// Admin routes
router.post('/', [verifyToken, checkRole(['admin']), createUploadMiddleware('testimonials').single('image')], testimonialController.create);
router.put('/:id', [verifyToken, checkRole(['admin']), createUploadMiddleware('testimonials').single('image')], testimonialController.update);
router.delete('/:id', [verifyToken, checkRole(['admin'])], testimonialController.delete);

module.exports = router;
