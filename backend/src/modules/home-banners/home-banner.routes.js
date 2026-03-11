const express = require('express');
const router = express.Router();
const controller = require('./home-banner.controller');
const verifyToken = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const upload = require('../../middlewares/upload.middleware')('banners');

router.get('/', controller.getAll);

router.post('/', [verifyToken, checkPermission('GESTIONAR_BANNERS_HOME'), upload.single('image')], controller.create);
router.put('/:id', [verifyToken, checkPermission('GESTIONAR_BANNERS_HOME'), upload.single('image')], controller.update);
router.delete('/:id', [verifyToken, checkPermission('ELIMINAR_BANNER_HOME')], controller.delete);

module.exports = router;
