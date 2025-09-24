const express = require('express');
const router = express.Router();
const {
    createTwoBHKPackage,
    getTwoBHKPackages,
    getTwoBHKPackageBySlug,
    updateTwoBHKPackage,
    deleteTwoBHKPackage
} = require('../controllers/twoBHKPackage.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadProduct } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getTwoBHKPackages);
router.get('/slug/:slug', getTwoBHKPackageBySlug);

// Protected routes (admin only)
router.post('/', authenticate, uploadProduct, createTwoBHKPackage);
router.put('/:id', authenticate, uploadProduct, updateTwoBHKPackage);
router.delete('/:id', authenticate, deleteTwoBHKPackage);

module.exports = router;













