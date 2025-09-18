const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

router.post('/', controller.createOrder);
router.get('/', authenticate, controller.getOrders);

// Delivery Partner Assignment Routes (must come before /:id routes)
router.get('/available-partners', controller.getAvailablePartners);
router.get('/partner/:partnerId', authenticate, controller.getOrdersByPartner);

router.get('/:id', authenticate, controller.getOrderById);
router.put('/:id', authenticate, controller.updateOrderStatus);
router.post('/:orderId/assign', authenticate, controller.assignOrderToPartner);
router.patch('/:orderId/delivery-status', authenticate, controller.updateDeliveryStatus);
router.post('/:orderId/reassign', authenticate, controller.reassignOrder);

module.exports = router;


