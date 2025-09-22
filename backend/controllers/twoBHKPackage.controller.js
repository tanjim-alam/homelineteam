const TwoBHKPackage = require('../models/TwoBHKPackage');
const { uploadBuffer } = require('../utils/cloudinary');

exports.createTwoBHKPackage = async (req, res, next) => {
    try {
        const {
            name, slug, description, basePrice, mrp, discount, category,
            kitchenLayout, wardrobe1Type, wardrobe2Type, materials, features, inclusions,
            availableLayouts, availableWardrobeTypes, availableMaterials, availableFeatures,
            hasVariants, variants, variantOptions, dynamicFields,
            packageMetadata, metaData, tags
        } = req.body;

        const mainImages = [];
        if (req.files && req.files.images) {
            for (const file of req.files.images) {
                const uploaded = await uploadBuffer(file.buffer, `2bhk-packages/${slug || name}`);
                mainImages.push(uploaded.secure_url);
            }
        }

        const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

        const doc = await TwoBHKPackage.create({
            name, slug, description, basePrice,
            mrp: mrp !== undefined && mrp !== '' ? parseFloat(mrp) : null,
            discount: discount !== undefined && discount !== '' ? parseFloat(discount) : null,
            category,
            mainImages,
            kitchenLayout,
            wardrobe1Type,
            wardrobe2Type,
            materials: parseMaybe(materials) || [],
            features: parseMaybe(features) || [],
            inclusions: parseMaybe(inclusions) || [],
            availableLayouts: parseMaybe(availableLayouts) || [],
            availableWardrobeTypes: parseMaybe(availableWardrobeTypes) || [],
            availableMaterials: parseMaybe(availableMaterials) || [],
            availableFeatures: parseMaybe(availableFeatures) || [],
            hasVariants: !!hasVariants,
            variants: parseMaybe(variants) || [],
            variantOptions: parseMaybe(variantOptions) || {},
            dynamicFields: parseMaybe(dynamicFields) || {},
            packageMetadata: parseMaybe(packageMetadata) || {},
            metaData: parseMaybe(metaData) || {},
            tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || [])
        });

        if (doc.hasVariants && Array.isArray(doc.variants)) {
            doc.variants = doc.variants.map(v => ({ ...v, sku: doc.generateVariantSKU(v) }));
            await doc.save();
        }

        res.status(201).json(doc);
    } catch (err) {
        next(err);
    }
};

exports.getTwoBHKPackages = async (req, res, next) => {
    try {
        const {
            kitchenLayout, wardrobe1Type, wardrobe2Type, materials, suitableFor, style, colorScheme,
            priceMin, priceMax, sort, limit, search
        } = req.query;

        const filter = {};

        // Layout filtering
        if (kitchenLayout) {
            const layoutArray = Array.isArray(kitchenLayout) ? kitchenLayout : JSON.parse(kitchenLayout);
            filter.kitchenLayout = { $in: layoutArray };
        }

        // Wardrobe type filtering
        if (wardrobe1Type) {
            const wardrobeArray = Array.isArray(wardrobe1Type) ? wardrobe1Type : JSON.parse(wardrobe1Type);
            filter.wardrobe1Type = { $in: wardrobeArray };
        }

        if (wardrobe2Type) {
            const wardrobeArray = Array.isArray(wardrobe2Type) ? wardrobe2Type : JSON.parse(wardrobe2Type);
            filter.wardrobe2Type = { $in: wardrobeArray };
        }

        // Materials filtering
        if (materials) {
            const materialsArray = Array.isArray(materials) ? materials : JSON.parse(materials);
            filter.materials = { $in: materialsArray };
        }

        // Package metadata filtering
        if (suitableFor) {
            const suitableForArray = Array.isArray(suitableFor) ? suitableFor : JSON.parse(suitableFor);
            filter['packageMetadata.suitableFor'] = { $in: suitableForArray };
        }

        if (style) {
            const styleArray = Array.isArray(style) ? style : JSON.parse(style);
            filter['packageMetadata.style'] = { $in: styleArray };
        }

        if (colorScheme) {
            const colorSchemeArray = Array.isArray(colorScheme) ? colorScheme : JSON.parse(colorScheme);
            filter['packageMetadata.colorScheme'] = { $in: colorSchemeArray };
        }

        // Price filtering
        if (priceMin || priceMax) {
            filter.basePrice = {};
            if (priceMin) filter.basePrice.$gte = parseFloat(priceMin);
            if (priceMax) filter.basePrice.$lte = parseFloat(priceMax);
        }

        // Search filtering
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let query = TwoBHKPackage.find(filter);

        // Sorting
        if (sort) {
            const sortMap = {
                'price-low': { basePrice: 1 },
                'price-high': { basePrice: -1 },
                'newest': { createdAt: -1 }
            };
            query = query.sort(sortMap[sort] || { createdAt: -1 });
        } else {
            query = query.sort({ createdAt: -1 });
        }

        if (limit && !isNaN(parseInt(limit))) {
            query = query.limit(parseInt(limit));
        }

        const items = await query.exec();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

exports.getTwoBHKPackageBySlug = async (req, res, next) => {
    try {
        const item = await TwoBHKPackage.findOne({ slug: req.params.slug });
        if (!item) return res.status(404).json({ message: '2BHK package not found' });
        item.views += 1;
        await item.save();
        res.json(item);
    } catch (err) {
        next(err);
    }
};

exports.updateTwoBHKPackage = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

        [
            'materials', 'features', 'inclusions', 'availableLayouts', 'availableWardrobeTypes',
            'availableMaterials', 'availableFeatures', 'variants', 'variantOptions',
            'dynamicFields', 'packageMetadata', 'metaData'
        ].forEach(k => {
            if (updates[k] !== undefined) updates[k] = parseMaybe(updates[k]);
        });

        if (req.files && req.files.images) {
            updates.mainImages = [];
            for (const file of req.files.images) {
                const uploaded = await uploadBuffer(file.buffer, `2bhk-packages/${updates.slug || req.params.id}`);
                updates.mainImages.push(uploaded.secure_url);
            }
        }

        const item = await TwoBHKPackage.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!item) return res.status(404).json({ message: '2BHK package not found' });

        if (updates.variants) {
            item.variants = updates.variants.map(v => ({ ...v, sku: item.generateVariantSKU(v) }));
            await item.save();
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
};

exports.deleteTwoBHKPackage = async (req, res, next) => {
    try {
        const deleted = await TwoBHKPackage.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: '2BHK package not found' });
        res.json({ message: '2BHK package deleted successfully' });
    } catch (err) {
        next(err);
    }
};












