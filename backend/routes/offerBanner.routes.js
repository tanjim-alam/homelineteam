const express = require('express');
const router = express.Router();
const controller = require('../controllers/offerBanner.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../middlewares/upload.middleware');

// Public
router.get('/active', controller.getActiveBanners);

// Admin
router.get('/', authenticate, controller.getBanners);
router.post('/', authenticate, uploadSingle, controller.createBanner);
router.put('/reorder', authenticate, controller.reorderBanners);
router.put('/:id', authenticate, uploadSingle, controller.updateBanner);
router.delete('/:id', authenticate, controller.deleteBanner);

module.exports = router;
