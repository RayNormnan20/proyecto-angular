const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const authMiddleware = require('../../middlewares/auth.middleware');

router.get('/', authMiddleware, permissionController.getAllPermissions);

module.exports = router;
