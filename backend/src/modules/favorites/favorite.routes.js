const express = require('express');
const router = express.Router();
const favoriteController = require('./favorite.controller');
const authenticateToken = require('../../middlewares/auth.middleware');

router.use(authenticateToken); // All favorite routes require authentication

router.post('/', favoriteController.addFavorite);
router.delete('/:producto_id', favoriteController.removeFavorite);
router.get('/', favoriteController.getFavorites);
router.get('/:producto_id/check', favoriteController.checkFavorite);

module.exports = router;
