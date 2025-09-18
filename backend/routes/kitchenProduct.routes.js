const express = require('express');
const router = express.Router();
const {
    createKitchenProduct,
    getKitchenProducts,
    getKitchenProductBySlug,
    updateKitchenProduct,
    deleteKitchenProduct
} = require('../controllers/kitchenProduct.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadProduct } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getKitchenProducts);
router.get('/slug/:slug', getKitchenProductBySlug);

// Protected routes (admin only)
router.post('/', authenticate, uploadProduct, createKitchenProduct);
router.put('/:id', authenticate, uploadProduct, updateKitchenProduct);
router.delete('/:id', authenticate, deleteKitchenProduct);

module.exports = router;

