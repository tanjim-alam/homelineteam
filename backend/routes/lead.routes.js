const express = require('express');
const router = express.Router();
const controller = require('../controllers/lead.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Public create lead
router.post('/', controller.createLead);

// Admin list/update
router.get('/', authenticate, requireAdmin, controller.getLeads);
router.patch('/:id/status', authenticate, requireAdmin, controller.updateLeadStatus);

module.exports = router;


