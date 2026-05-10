const express = require('express');
const router = express.Router();
const controller = require('../controllers/settings.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/', authenticate, requireAdmin, controller.getSettings);
router.put('/', authenticate, requireAdmin, controller.updateSettings);

module.exports = router;
