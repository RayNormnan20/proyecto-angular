const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, roleController.getAllRoles);
router.post('/', authMiddleware, roleController.createRole);
router.delete('/:id', authMiddleware, roleController.deleteRole);
router.put('/:id', authMiddleware, roleController.updateRole);

module.exports = router;
