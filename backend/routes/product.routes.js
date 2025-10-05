const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');
const { uploadProduct } = require('../middlewares/upload.middleware');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', controller.getProducts);
router.get('/search', controller.searchProducts);
router.get('/:slug/related', controller.getRelatedProducts);
router.get('/:slug', controller.getProductBySlug);

// Admin routes (require authentication and admin role)
router.post('/', authenticate, requireAdmin, uploadProduct, controller.createProduct);
router.put('/:id', authenticate, requireAdmin, uploadProduct, controller.updateProduct);
router.delete('/:id', authenticate, requireAdmin, controller.deleteProduct);

module.exports = router;


