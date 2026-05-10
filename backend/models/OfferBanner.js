const mongoose = require('mongoose');

const offerBannerSchema = new mongoose.Schema({
    text: { type: String, default: '' },
    link: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    publicId: { type: String, default: '' },
    backgroundColor: { type: String, default: '#2563eb' },
    textColor: { type: String, default: '#ffffff' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('OfferBanner', offerBannerSchema);
