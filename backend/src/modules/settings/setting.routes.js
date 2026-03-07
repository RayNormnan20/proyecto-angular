const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, uploadQr } = require('./setting.controller');
const verifyToken = require('../../middlewares/auth.middleware');
const verifyRole = require('../../middlewares/role.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const upload = require('../../middlewares/upload.middleware')('settings');

// Public access to read settings (for cart)
router.get('/', getSettings);

// Admin/Staff access to update settings
router.put('/', verifyToken, checkPermission('GESTIONAR_CONFIGURACION'), updateSettings);

// Admin/Staff access to upload QR
router.post('/upload-qr', verifyToken, checkPermission('GESTIONAR_CONFIGURACION'), upload.single('image'), uploadQr);

module.exports = router;
