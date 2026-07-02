const express = require('express');
const router = express.Router();
const controller = require('../controllers/lead.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Public create lead
router.post('/', controller.createLead);


// Admin list/update
router.get('/',         authenticate, requireAdmin, controller.getLeads);
router.get('/bookings', authenticate, requireAdmin, controller.getBookings);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateLeadStatus);
router.delete('/:id',  authenticate, requireAdmin, controller.deleteLead);

// Test email functionality (admin only)
router.get('/test-email', authenticate, requireAdmin, controller.testEmail);

module.exports = router;


