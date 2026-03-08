const express = require('express');
const router = express.Router();
const { getEmailLogs, resendEmail } = require('./email-log.controller');
const verifyToken = require('../../middlewares/auth.middleware');
const verifyRole = require('../../middlewares/role.middleware');

// Only admin can view email logs
router.get('/', verifyToken, verifyRole(['admin']), getEmailLogs);

// Resend email endpoint
router.post('/:id/resend', verifyToken, verifyRole(['admin']), resendEmail);

module.exports = router;
