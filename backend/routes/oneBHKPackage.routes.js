const express = require('express');
const router = express.Router();
const {
    createOneBHKPackage,
    getOneBHKPackages,
    getOneBHKPackageBySlug,
    updateOneBHKPackage,
    deleteOneBHKPackage
} = require('../controllers/oneBHKPackage.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadProduct } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getOneBHKPackages);
router.get('/slug/:slug', getOneBHKPackageBySlug);

// Protected routes (admin only)
router.post('/', authenticate, uploadProduct, createOneBHKPackage);
router.put('/:id', authenticate, uploadProduct, updateOneBHKPackage);
router.delete('/:id', authenticate, deleteOneBHKPackage);

module.exports = router;






