const express = require('express');
const router = express.Router();
const {
  getHeroSection,
  updateHeroSection,
  uploadHeroImage,
  deleteHeroImage
} = require('../controllers/heroSection.controller');
const { uploadSingle } = require('../middlewares/upload.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Public routes
router.get('/', getHeroSection);

// Protected routes (admin only)
router.put('/', authenticate, updateHeroSection);
router.post('/upload-image', authenticate, uploadSingle, uploadHeroImage);
router.delete('/image/:publicId', authenticate, deleteHeroImage);

module.exports = router;
