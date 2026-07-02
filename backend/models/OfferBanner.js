const mongoose = require('mongoose');

const POSITIONS = ['below-hero', 'below-categories', 'below-products', 'below-design', 'all'];

const offerBannerSchema = new mongoose.Schema({
    text: { type: String, default: '' },
    link: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    publicId: { type: String, default: '' },
    backgroundColor: { type: String, default: '#2563eb' },
    textColor: { type: String, default: '#ffffff' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // 'all' shows the banner in every position slot on the home page
    position: { type: String, enum: POSITIONS, default: 'below-hero' },
}, { timestamps: true });

module.exports = mongoose.model('OfferBanner', offerBannerSchema);
module.exports.POSITIONS = POSITIONS;
