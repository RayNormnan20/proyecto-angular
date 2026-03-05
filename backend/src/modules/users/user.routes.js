const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, userController.getAllUsers);
router.post('/', authMiddleware, userController.createUser);
router.delete('/:id', authMiddleware, userController.deleteUser);
router.put('/:id', authMiddleware, userController.updateUser);

module.exports = router;
