const express = require('express')
const router = express.Router()
const controller = require('../controllers/mainCategory.controller')
const { authenticate } = require('../middlewares/auth.middleware')

// Public routes
router.get('/', controller.getMainCategories)

// Protected routes (require authentication)
router.post('/', authenticate, controller.createMainCategory)
router.get('/:id', authenticate, controller.getMainCategoryById)
router.put('/:id', authenticate, controller.updateMainCategory)
router.delete('/:id', authenticate, controller.deleteMainCategory)
router.get('/:id/subcategories', authenticate, controller.getMainCategoryWithSubcategories)

module.exports = router
