const express = require('express');
const router = express.Router();
const controller = require('./payment-method.controller');
const authenticateToken = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

// Public routes (users need to see payment methods)
router.get('/', controller.getAll);
router.get('/:id', controller.getById);

// Protected routes (admin only - TODO: Add admin check)
router.post('/', authenticateToken, controller.create);
router.put('/:id', authenticateToken, controller.update);
router.post('/:id/image', authenticateToken, upload.single('image'), controller.uploadImage);
router.delete('/:id', authenticateToken, controller.delete);

module.exports = router;
