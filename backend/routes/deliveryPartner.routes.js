const express = require('express');
const router = express.Router();
const {
    createDeliveryPartner,
    getDeliveryPartners,
    getDeliveryPartnerById,
    getDeliveryPartnerBySlug,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    updatePartnerStatus,
    updatePerformance,
    getPartnersByArea
} = require('../controllers/deliveryPartner.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadDocuments } = require('../middlewares/upload.middleware');

// Public routes
router.get('/', getDeliveryPartners);
router.get('/area', getPartnersByArea);
router.get('/slug/:slug', getDeliveryPartnerBySlug);
router.get('/:id', getDeliveryPartnerById);

// Protected routes (admin only)
router.post('/', authenticate, uploadDocuments, createDeliveryPartner);
router.put('/:id', authenticate, uploadDocuments, updateDeliveryPartner);
router.delete('/:id', authenticate, deleteDeliveryPartner);
router.patch('/:id/status', authenticate, updatePartnerStatus);
router.patch('/:id/performance', authenticate, updatePerformance);

module.exports = router;














