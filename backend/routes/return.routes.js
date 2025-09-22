const express = require('express');
const router = express.Router();
const controller = require('../controllers/return.controller');
const { authenticateUser } = require('../middlewares/userAuth.middleware');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// User routes (authentication required)
router.post('/', authenticateUser, controller.createReturnRequest);
router.get('/my-returns', authenticateUser, controller.getUserReturns);
router.get('/:id', authenticateUser, controller.getReturnById);
router.put('/:id', authenticateUser, controller.updateReturnRequest);
router.patch('/:id/cancel', authenticateUser, controller.cancelReturnRequest);

// Admin routes (admin authentication required)
router.get('/admin/all', authenticate, requireAdmin, controller.getAllReturns);
router.get('/admin/products', authenticate, requireAdmin, controller.getAllReturnProducts);
router.get('/admin/:id', authenticate, requireAdmin, controller.getReturnByIdAdmin);
router.patch('/admin/:id/status', authenticate, requireAdmin, controller.updateReturnStatus);
router.patch('/admin/:id/process-refund', authenticate, requireAdmin, controller.processRefund);
router.patch('/admin/:id/complete-refund', authenticate, requireAdmin, controller.completeRefund);
router.get('/admin/stats', authenticate, requireAdmin, controller.getReturnStats);

module.exports = router;
