const OfferBanner = require('../models/OfferBanner');
const { uploadBuffer } = require('../utils/cloudinary');

exports.getBanners = async (req, res, next) => {
    try {
        const banners = await OfferBanner.find().sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: banners });
    } catch (err) { next(err); }
};

exports.getActiveBanners = async (req, res, next) => {
    try {
        const { position } = req.query;
        const filter = { isActive: true };
        // A banner placed at 'all' shows up in every position slot the frontend asks for
        if (position) filter.position = { $in: [position, 'all'] };
        const banners = await OfferBanner.find(filter).sort({ order: 1, createdAt: 1 });
        res.json({ success: true, data: banners });
    } catch (err) { next(err); }
};

exports.createBanner = async (req, res, next) => {
    try {
        const { text, link, backgroundColor, textColor, isActive, order, position } = req.body;
        let imageUrl = '', publicId = '';

        if (req.file) {
            const result = await uploadBuffer(req.file.buffer, 'offer-banners');
            imageUrl = result.secure_url;
            publicId = result.public_id;
        }

        const banner = await OfferBanner.create({
            text, link, imageUrl, publicId,
            backgroundColor: backgroundColor || '#2563eb',
            textColor: textColor || '#ffffff',
            isActive: isActive !== 'false',
            order: order || 0,
            position: position || 'below-hero',
        });
        res.status(201).json({ success: true, data: banner });
    } catch (err) { next(err); }
};

exports.updateBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text, link, backgroundColor, textColor, isActive, order, position } = req.body;
        const update = { text, link, backgroundColor, textColor, isActive: isActive === true || isActive === 'true', order, position };

        if (req.file) {
            const result = await uploadBuffer(req.file.buffer, 'offer-banners');
            update.imageUrl = result.secure_url;
            update.publicId = result.public_id;
        }

        const banner = await OfferBanner.findByIdAndUpdate(id, update, { new: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        res.json({ success: true, data: banner });
    } catch (err) { next(err); }
};

exports.deleteBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        await OfferBanner.findByIdAndDelete(id);
        res.json({ success: true, message: 'Banner deleted' });
    } catch (err) { next(err); }
};

exports.reorderBanners = async (req, res, next) => {
    try {
        const { ids } = req.body; // array of ids in order
        await Promise.all(ids.map((id, idx) => OfferBanner.findByIdAndUpdate(id, { order: idx })));
        res.json({ success: true });
    } catch (err) { next(err); }
};
