const HeroSection = require('../models/HeroSection');
const { uploadBuffer } = require('../utils/cloudinary');

// Get hero section data
const getHeroSection = async (req, res) => {
  try {
    let heroSection = await HeroSection.findOne({ isActive: true });

    // If no hero section exists, create a minimal default one
    if (!heroSection) {
      heroSection = new HeroSection({
        mobileBackgroundImages: [
          {
            imageUrl: '/mobileheroimg1.png',
            altText: 'Mobile Hero Background 1',
            isActive: true,
            order: 0
          }
        ],
        desktopBackgroundImages: [
          {
            imageUrl: '/hero-bg-1.jpg',
            altText: 'Desktop Hero Background 1',
            isActive: true,
            order: 0
          }
        ],
        categories: [], // Start with empty categories
        sliderSettings: {
          autoSlide: true,
          slideInterval: 3000,
          transitionDuration: 1000
        }
      });
      await heroSection.save();
    }

    res.json({
      success: true,
      data: heroSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hero section data',
      error: error.message
    });
  }
};

// Update hero section data
const updateHeroSection = async (req, res) => {
  try {
    const { mobileBackgroundImages, desktopBackgroundImages, categories, sliderSettings } = req.body;

    let heroSection = await HeroSection.findOne({ isActive: true });

    if (!heroSection) {
      heroSection = new HeroSection();
    }

    // Update mobile background images
    if (mobileBackgroundImages) {
      heroSection.mobileBackgroundImages = mobileBackgroundImages;
    }

    // Update desktop background images
    if (desktopBackgroundImages) {
      heroSection.desktopBackgroundImages = desktopBackgroundImages;
    }

    // Update categories
    if (categories) {
      heroSection.categories = categories;
    }

    // Update slider settings
    if (sliderSettings) {
      heroSection.sliderSettings = { ...heroSection.sliderSettings, ...sliderSettings };
    }

    await heroSection.save();

    res.json({
      success: true,
      message: 'Hero section updated successfully',
      data: heroSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating hero section',
      error: error.message
    });
  }
};

// Upload hero image
const uploadHeroImage = async (req, res) => {
  try {
    const { type } = req.query; // 'mobile' or 'desktop'

    // Upload request received

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary using the buffer
    const folder = type === 'desktop' ? 'hero-section/desktop' : 'hero-section/mobile';
    const result = await uploadBuffer(req.file.buffer, folder);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// Delete hero image
const deleteHeroImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

module.exports = {
  getHeroSection,
  updateHeroSection,
  uploadHeroImage,
  deleteHeroImage
};
