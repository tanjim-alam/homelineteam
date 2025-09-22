const express = require('express');
const router = express.Router();
const controller = require('../controllers/user.controller');
const { authenticateUser } = require('../middlewares/userAuth.middleware');

// Public routes (no authentication required)
router.post('/register', controller.register);
router.post('/verify-email', controller.verifyEmail);
router.post('/resend-email-otp', controller.resendEmailOTP);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password', controller.resetPassword);

// Development/Admin routes
router.post('/manual-verify', controller.manualVerifyUser);

// Protected routes (authentication required) - MUST come before parameterized routes
router.get('/profile', authenticateUser, controller.getProfile);
router.put('/profile', authenticateUser, controller.updateProfile);
router.post('/addresses', authenticateUser, controller.addAddress);
router.put('/addresses/:addressId', authenticateUser, controller.updateAddress);
router.delete('/addresses/:addressId', authenticateUser, controller.deleteAddress);

// Admin routes (for admin panel) - parameterized routes must come last
router.get('/', controller.getAllUsers);
router.get('/:id', controller.getUserById);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);
router.patch('/:id/toggle-status', controller.toggleUserStatus);

module.exports = router;
