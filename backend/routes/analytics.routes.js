const express = require('express');
const router = express.Router();
const controller = require('../controllers/analytics.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Dashboard analytics (admin only)
router.get('/dashboard', authenticate, requireAdmin, controller.getDashboardAnalytics);

// Route information (admin only)
router.get('/routes', authenticate, requireAdmin, controller.getRouteInfo);

module.exports = router;


