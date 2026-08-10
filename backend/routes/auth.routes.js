const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// Locked to existing admins only — new accounts are created via Team Management.
router.post('/register', authenticate, requireAdmin, controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/me', authenticate, controller.me);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);
router.patch('/change-password', authenticate, controller.changePassword);

module.exports = router;


