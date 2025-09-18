const KitchenProduct = require('../models/KitchenProduct');
const { uploadBuffer } = require('../utils/cloudinary');

exports.createKitchenProduct = async (req, res, next) => {
    try {
        const {
            name, slug, description, basePrice, mrp, discount, category,
            defaultLayout, defaultMaterials, defaultAppliances, defaultFeatures,
            availableLayouts, availableMaterials, availableAppliances, availableFeatures,
            hasVariants, variants, variantOptions, dynamicFields,
            kitchenMetadata, metaData, tags
        } = req.body;

        const mainImages = [];
        if (req.files && req.files.images) {
            for (const file of req.files.images) {
                const uploaded = await uploadBuffer(file.buffer, `kitchens/${slug || name}`);
                mainImages.push(uploaded.secure_url);
            }
        }

        const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

        const doc = await KitchenProduct.create({
            name, slug, description, basePrice,
            mrp: mrp !== undefined && mrp !== '' ? parseFloat(mrp) : null,
            discount: discount !== undefined && discount !== '' ? parseFloat(discount) : null,
            category,
            mainImages,
            defaultLayout: parseMaybe(defaultLayout) || null,
            defaultMaterials: parseMaybe(defaultMaterials) || [],
            defaultAppliances: parseMaybe(defaultAppliances) || [],
            defaultFeatures: parseMaybe(defaultFeatures) || [],
            availableLayouts: parseMaybe(availableLayouts) || [],
            availableMaterials: parseMaybe(availableMaterials) || [],
            availableAppliances: parseMaybe(availableAppliances) || [],
            availableFeatures: parseMaybe(availableFeatures) || [],
            hasVariants: !!hasVariants,
            variants: parseMaybe(variants) || [],
            variantOptions: parseMaybe(variantOptions) || {},
            dynamicFields: parseMaybe(dynamicFields) || {},
            kitchenMetadata: parseMaybe(kitchenMetadata) || {},
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

exports.getKitchenProducts = async (req, res, next) => {
    try {
        const {
            layout, materials, suitableFor, style, colorScheme,
            priceMin, priceMax, sort, limit, search
        } = req.query;

        const filter = {};

        // Layout filtering
        if (layout) {
            const layoutArray = Array.isArray(layout) ? layout : JSON.parse(layout);
            filter['defaultLayout.type'] = { $in: layoutArray };
        }

        // Materials filtering
        if (materials) {
            const materialsArray = Array.isArray(materials) ? materials : JSON.parse(materials);
            filter['defaultMaterials.material'] = { $in: materialsArray };
        }

        // Kitchen metadata filtering
        if (suitableFor) {
            const suitableForArray = Array.isArray(suitableFor) ? suitableFor : JSON.parse(suitableFor);
            filter['kitchenMetadata.suitableFor'] = { $in: suitableForArray };
        }

        if (style) {
            const styleArray = Array.isArray(style) ? style : JSON.parse(style);
            filter['kitchenMetadata.style'] = { $in: styleArray };
        }

        if (colorScheme) {
            const colorSchemeArray = Array.isArray(colorScheme) ? colorScheme : JSON.parse(colorScheme);
            filter['kitchenMetadata.colorScheme'] = { $in: colorSchemeArray };
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

        let query = KitchenProduct.find(filter);

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

exports.getKitchenProductBySlug = async (req, res, next) => {
    try {
        const item = await KitchenProduct.findOne({ slug: req.params.slug });
        if (!item) return res.status(404).json({ message: 'Kitchen product not found' });
        item.views += 1;
        await item.save();
        res.json(item);
    } catch (err) {
        next(err);
    }
};

exports.updateKitchenProduct = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

        [
            'defaultLayout', 'defaultMaterials', 'defaultAppliances', 'defaultFeatures',
            'availableLayouts', 'availableMaterials', 'availableAppliances', 'availableFeatures',
            'variants', 'variantOptions', 'dynamicFields', 'kitchenMetadata', 'metaData'
        ].forEach(k => {
            if (updates[k] !== undefined) updates[k] = parseMaybe(updates[k]);
        });

        if (req.files && req.files.images) {
            updates.mainImages = [];
            for (const file of req.files.images) {
                const uploaded = await uploadBuffer(file.buffer, `kitchens/${updates.slug || req.params.id}`);
                updates.mainImages.push(uploaded.secure_url);
            }
        }

        const item = await KitchenProduct.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!item) return res.status(404).json({ message: 'Kitchen product not found' });

        if (updates.variants) {
            item.variants = updates.variants.map(v => ({ ...v, sku: item.generateVariantSKU(v) }));
            await item.save();
        }

        res.json(item);
    } catch (err) {
        next(err);
    }
};

exports.deleteKitchenProduct = async (req, res, next) => {
    try {
        const deleted = await KitchenProduct.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Kitchen product not found' });
        res.json({ message: 'Kitchen product deleted successfully' });
    } catch (err) {
        next(err);
    }
};

