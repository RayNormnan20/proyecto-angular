const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const verifyToken = require('../../middlewares/auth.middleware');

router.post('/register', [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate
], authController.register);

router.post('/login', [
  body('email').isEmail().withMessage('El email no es válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  validate
], authController.login);

router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('El Refresh Token es obligatorio'),
  validate
], authController.refreshToken);

router.post('/logout', authController.logout);

router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
