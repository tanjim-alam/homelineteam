const express = require('express');
const router = express.Router();
const {
  createWardrobeProduct,
  getWardrobeProducts,
  getWardrobeProductBySlug,
  updateWardrobeProduct,
  deleteWardrobeProduct
} = require('../controllers/wardrobeProduct.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadProduct } = require('../middlewares/upload.middleware');

// Public
router.get('/', getWardrobeProducts);
router.get('/slug/:slug', getWardrobeProductBySlug);

// Protected
router.post('/', authenticate, uploadProduct, createWardrobeProduct);
router.put('/:id', authenticate, uploadProduct, updateWardrobeProduct);
router.delete('/:id', authenticate, deleteWardrobeProduct);

module.exports = router;








