const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');

// Ruta pública para enviar mensaje de contacto
router.post('/', contactController.sendMessage);

module.exports = router;
