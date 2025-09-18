const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');
const { uploadCategory, uploadCategoryText } = require('../middlewares/upload.middleware');

const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');



// Public routes
router.get('/', controller.getCategories);
router.get('/:slug', controller.getCategoryBySlug);
router.get('/id/:id', controller.getCategoryById);
router.get('/:slug/filter-options', controller.getCategoryFilterOptions);

// Admin routes (require authentication and admin role)
router.post('/', authenticate, requireAdmin, uploadCategory, controller.createCategory);
router.put('/:id', authenticate, requireAdmin, uploadCategory, controller.updateCategory);
router.delete('/:id', authenticate, requireAdmin, controller.deleteCategory);
router.post('/:categoryId/fields', authenticate, requireAdmin, controller.addCustomField);
router.post('/:categoryId/variant-fields', authenticate, requireAdmin, controller.addVariantField);

// Test route for metadata updates (temporary)
router.post('/:id/test-metadata', async (req, res) => {
  try {
    const { id } = req.params;
    const Category = require('../models/Category');

    // Testing direct metadata update for category

    const category = await Category.findByIdAndUpdate(
      id,
      {
        $set: {
          'metaData.title': 'Direct Test Title',
          'metaData.description': 'Direct Test Description',
          'metaData.keywords': ['direct', 'test', 'metadata']
        }
      },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({
      message: 'Test metadata update successful',
      metaData: category.metaData,
      category
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


