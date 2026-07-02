const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Locked to existing admins only — new accounts are created via Team Management.
router.post('/register', authenticate, requireAdmin, controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);

module.exports = router;


