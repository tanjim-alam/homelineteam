const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadBuffer } = require('../utils/cloudinary');

// Helper to ensure only fields defined for category are accepted
async function pickDynamicFields(categoryId, incomingFields) {
    const category = await Category.findById(categoryId);
    if (!category) throw new Error('Invalid category');
    const allowedSlugs = new Set((category.customFields || []).map((f) => f.slug));
    const picked = {};
    Object.entries(incomingFields || {}).forEach(([key, value]) => {
        if (allowedSlugs.has(key)) picked[key] = value;
    });
    return picked;
}

// Create product
exports.createProduct = async (req, res, next) => {
    try {
        const {
            categoryId,
            name,
            slug,
            basePrice,
            mrp,
            discount,
            description,
            variants,
            variantOptions,
            hasVariants
        } = req.body;


        // Handle metadata - support both nested object and flat fields
        let metaData = {};

        // ✅ Handle nested metaData object (from admin panel)
        if (req.body.metaData && typeof req.body.metaData === 'object') {

            if (req.body.metaData.title !== undefined) {
                metaData.title = req.body.metaData.title || '';
            }
            if (req.body.metaData.description !== undefined) {
                metaData.description = req.body.metaData.description || '';
            }
            if (req.body.metaData.keywords !== undefined) {
                // Convert keywords string to array if it's not empty
                const keywordsString = req.body.metaData.keywords || '';
                if (keywordsString && keywordsString.trim()) {
                    metaData.keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
                } else {
                    metaData.keywords = [];
                }
            }
            if (req.body.metaData.ogImage !== undefined) {
                metaData.ogImage = req.body.metaData.ogImage || '';
            }
        } else {
            // ✅ Handle FormData fields for metaData (fallback for Postman)

            if (req.body['metaData[title]'] !== undefined) metaData.title = req.body['metaData[title]'] || '';
            if (req.body['metaData[description]'] !== undefined) metaData.description = req.body['metaData[description]'] || '';
            if (req.body['metaData[keywords]'] !== undefined) {
                // Convert keywords string to array
                const keywordsString = req.body['metaData[keywords]'] || '';
                if (keywordsString && keywordsString.trim()) {
                    metaData.keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
                } else {
                    metaData.keywords = [];
                }
            }
        }

        const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        const parsedVariantOptions = variantOptions ? (typeof variantOptions === 'string' ? JSON.parse(variantOptions) : variantOptions) : {};

        const dynamicFieldsRaw = req.body.dynamicFields ? (typeof req.body.dynamicFields === 'string' ? JSON.parse(req.body.dynamicFields) : req.body.dynamicFields) : {};
        const dynamicFields = await pickDynamicFields(categoryId, dynamicFieldsRaw);

        const mainImages = [];

        if (req.files && req.files.images) {
            for (const file of req.files.images) {
                const uploaded = await uploadBuffer(file.buffer, `products/${slug || name}`);
                mainImages.push(uploaded.secure_url);
            }
        }

        // Process variants if they exist
        let processedVariants = [];
        if (hasVariants && parsedVariants && Array.isArray(parsedVariants)) {
            for (const variant of parsedVariants) {
                // Generate SKU for each variant
                const variantWithSKU = { ...variant };

                // Handle variant-specific images if any
                if (variant.images && Array.isArray(variant.images)) {
                    variantWithSKU.images = variant.images;
                }

                processedVariants.push(variantWithSKU);
            }
        }

        // Validate and prepare MRP and discount values
        let mrpValue = null;
        let discountValue = null;


        if (mrp !== undefined && mrp !== '' && mrp !== null) {
            mrpValue = parseFloat(mrp);
            if (isNaN(mrpValue)) {
                return res.status(400).json({ message: 'Invalid MRP value' });
            }
        }

        if (discount !== undefined && discount !== '' && discount !== null) {
            discountValue = parseFloat(discount);
            if (isNaN(discountValue)) {
                return res.status(400).json({ message: 'Invalid discount value' });
            }
            if (discountValue < 0 || discountValue > 100) {
                return res.status(400).json({ message: 'Discount must be between 0 and 100' });
            }
        }


        const product = await Product.create({
            categoryId,
            name,
            slug,
            basePrice,
            mrp: mrpValue,
            discount: discountValue,
            description,
            mainImages,
            dynamicFields,
            variantOptions: parsedVariantOptions,
            metaData,
            hasVariants: hasVariants || false,
            variants: processedVariants
        });


        // Generate SKUs for variants after product creation
        if (hasVariants && processedVariants.length > 0) {
            for (let i = 0; i < processedVariants.length; i++) {
                processedVariants[i].sku = product.generateVariantSKU(processedVariants[i]);
            }
            product.variants = processedVariants;
            await product.save();
        }

        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

// Update product
exports.updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            categoryId,
            name,
            slug,
            basePrice,
            mrp,
            discount,
            description,
            metaData,
            variants,
            variantOptions,
            hasVariants
        } = req.body;

        const updates = { categoryId, name, slug, basePrice, description };

        // Validate and prepare MRP and discount values
        if (mrp !== undefined) {
            if (mrp === '' || mrp === null) {
                updates.mrp = null;
            } else {
                const mrpValue = parseFloat(mrp);
                if (isNaN(mrpValue)) {
                    return res.status(400).json({ message: 'Invalid MRP value' });
                }
                updates.mrp = mrpValue;
            }
        }

        if (discount !== undefined) {
            if (discount === '' || discount === null) {
                updates.discount = null;
            } else {
                const discountValue = parseFloat(discount);
                if (isNaN(discountValue)) {
                    return res.status(400).json({ message: 'Invalid discount value' });
                }
                if (discountValue < 0 || discountValue > 100) {
                    return res.status(400).json({ message: 'Discount must be between 0 and 100' });
                }
                updates.discount = discountValue;
            }
        }


        // Handle metadata - support both nested object and flat fields
        if (req.body.metaData && typeof req.body.metaData === 'object') {
            updates.metaData = {};

            if (req.body.metaData.title !== undefined) {
                updates.metaData.title = req.body.metaData.title || '';
            }
            if (req.body.metaData.description !== undefined) {
                updates.metaData.description = req.body.metaData.description || '';
            }
            if (req.body.metaData.keywords !== undefined) {
                // Convert keywords string to array if it's not empty
                const keywordsString = req.body.metaData.keywords || '';
                if (keywordsString && keywordsString.trim()) {
                    updates.metaData.keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
                } else {
                    updates.metaData.keywords = [];
                }
            }
            if (req.body.metaData.ogImage !== undefined) {
                updates.metaData.ogImage = req.body.metaData.ogImage || '';
            }
        } else {
            // ✅ Handle FormData fields for metaData (fallback for Postman)
            if (req.body['metaData[title]'] !== undefined) {
                updates.metaData = updates.metaData || {};
                updates.metaData.title = req.body['metaData[title]'] || '';
            }
            if (req.body['metaData[description]'] !== undefined) {
                updates.metaData = updates.metaData || {};
                updates.metaData.description = req.body['metaData[description]'] || '';
            }
            if (req.body['metaData[keywords]'] !== undefined) {
                updates.metaData = updates.metaData || {};
                // Convert keywords string to array
                const keywordsString = req.body['metaData[keywords]'] || '';
                if (keywordsString && keywordsString.trim()) {
                    updates.metaData.keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
                } else {
                    updates.metaData.keywords = [];
                }
            }
        }


        // ✅ Handle Open Graph image update
        if (req.files && req.files['metaData[ogImage]']) {
            const ogImageFile = req.files['metaData[ogImage]'][0];
            const uploaded = await uploadBuffer(ogImageFile.buffer, `products/og-images/${slug || id}`);
            updates.metaData = updates.metaData || {};
            updates.metaData.ogImage = uploaded.secure_url;
        }
        if (variants) updates.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        if (variantOptions) updates.variantOptions = typeof variantOptions === 'string' ? JSON.parse(variantOptions) : variantOptions;
        if (hasVariants !== undefined) updates.hasVariants = hasVariants;

        if (req.body.dynamicFields) {
            const dynamicFieldsRaw = typeof req.body.dynamicFields === 'string' ? JSON.parse(req.body.dynamicFields) : req.body.dynamicFields;
            updates.dynamicFields = await pickDynamicFields(categoryId, dynamicFieldsRaw);
        }

        if (req.files && req.files.images && req.files.images.length) {
            updates.mainImages = [];
            for (const file of req.files.images) {
                const uploaded = await uploadBuffer(file.buffer, `products/${slug || id}`);
                updates.mainImages.push(uploaded.secure_url);
            }
        }

        const product = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Update SKUs for variants if they changed
        if (hasVariants && updates.variants && Array.isArray(updates.variants)) {
            for (let i = 0; i < updates.variants.length; i++) {
                updates.variants[i].sku = product.generateVariantSKU(updates.variants[i]);
            }
            product.variants = updates.variants;
            await product.save();
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};

// Get all products (optional filters)
exports.getProducts = async (req, res, next) => {
    try {
        const {
            categorySlug,
            categoryId,
            subcategoryId,
            featured,
            limit,
            sort,
            // Advanced filtering parameters
            priceRange,
            brands,
            ratings,
            availability,
            // Dynamic filters from category custom fields
            material,
            style,
            color,
            // Variant filters
            ...variantFilters
        } = req.query;

        const filter = {};

        // Basic category filtering
        if (categoryId) filter.categoryId = categoryId;
        if (subcategoryId) filter.categoryId = subcategoryId;
        if (categorySlug) {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) filter.categoryId = category._id;
        }

        // Price range filtering
        if (priceRange) {
            try {
                const { min, max } = JSON.parse(priceRange);
                if (min !== undefined && max !== undefined && !isNaN(parseFloat(min)) && !isNaN(parseFloat(max))) {
                    filter.basePrice = { $gte: parseFloat(min), $lte: parseFloat(max) };
                }
            } catch (e) {
            }
        }

        // Brand filtering
        if (brands) {
            try {
                const brandArray = JSON.parse(brands);
                if (Array.isArray(brandArray) && brandArray.length > 0) {
                    const dynamicFieldFilter = { 'dynamicFields.brand': { $in: brandArray } };
                    const variantFieldFilter = { 'variants.fields.brand': { $in: brandArray } };

                    if (!filter.$or) {
                        filter.$or = [];
                    }
                    filter.$or.push(dynamicFieldFilter);
                    filter.$or.push(variantFieldFilter);
                }
            } catch (e) {
            }
        }

        // Rating filtering (if ratings are implemented)
        if (ratings) {
            try {
                const ratingArray = JSON.parse(ratings);
                if (Array.isArray(ratingArray) && ratingArray.length > 0) {
                    // This would need to be implemented based on your rating system
                    // filter.rating = { $in: ratingArray };
                }
            } catch (e) {
            }
        }

        // Availability filtering
        if (availability) {
            try {
                const availabilityArray = JSON.parse(availability);
                if (Array.isArray(availabilityArray) && availabilityArray.length > 0) {
                    // For now, we'll skip availability filtering until stock system is implemented
                }
            } catch (e) {
            }
        }

        // Dynamic filters from category custom fields
        if (material) {
            try {
                const materialArray = JSON.parse(material);
                if (Array.isArray(materialArray) && materialArray.length > 0) {
                    const dynamicFieldFilter = { 'dynamicFields.material': { $in: materialArray } };
                    const variantFieldFilter = { 'variants.fields.material': { $in: materialArray } };

                    if (!filter.$or) {
                        filter.$or = [];
                    }
                    filter.$or.push(dynamicFieldFilter);
                    filter.$or.push(variantFieldFilter);
                }
            } catch (e) {
            }
        }

        if (style) {
            try {
                const styleArray = JSON.parse(style);
                if (Array.isArray(styleArray) && styleArray.length > 0) {
                    const dynamicFieldFilter = { 'dynamicFields.style': { $in: styleArray } };
                    const variantFieldFilter = { 'variants.fields.style': { $in: styleArray } };

                    if (!filter.$or) {
                        filter.$or = [];
                    }
                    filter.$or.push(dynamicFieldFilter);
                    filter.$or.push(variantFieldFilter);
                }
            } catch (e) {
            }
        }

        if (color) {
            try {
                const colorArray = JSON.parse(color);
                if (Array.isArray(colorArray) && colorArray.length > 0) {
                    const dynamicFieldFilter = { 'dynamicFields.color': { $in: colorArray } };
                    const variantFieldFilter = { 'variants.fields.color': { $in: colorArray } };

                    if (!filter.$or) {
                        filter.$or = [];
                    }
                    filter.$or.push(dynamicFieldFilter);
                    filter.$or.push(variantFieldFilter);
                }
            } catch (e) {
            }
        }

        // Handle other dynamic filters
        Object.keys(variantFilters).forEach(key => {
            try {
                const value = JSON.parse(variantFilters[key]);
                if (Array.isArray(value) && value.length > 0) {
                    // Check both dynamicFields and variants.fields for the filter
                    const dynamicFieldFilter = { [`dynamicFields.${key}`]: { $in: value } };
                    const variantFieldFilter = { [`variants.fields.${key}`]: { $in: value } };

                    // Use $or to match either dynamicFields or variants.fields
                    if (!filter.$or) {
                        filter.$or = [];
                    }
                    filter.$or.push(dynamicFieldFilter);
                    filter.$or.push(variantFieldFilter);
                }
            } catch (e) {
            }
        });


        // Build query
        let query = Product.find(filter);

        // Apply sorting
        if (sort) {
            switch (sort) {
                case 'price-low':
                    query = query.sort({ basePrice: 1 });
                    break;
                case 'price-high':
                    query = query.sort({ basePrice: -1 });
                    break;
                case 'newest':
                    query = query.sort({ createdAt: -1 });
                    break;
                case 'oldest':
                    query = query.sort({ createdAt: 1 });
                    break;
                case 'name-asc':
                    query = query.sort({ name: 1 });
                    break;
                case 'name-desc':
                    query = query.sort({ name: -1 });
                    break;
                default:
                    query = query.sort({ createdAt: -1 });
            }
        } else {
            query = query.sort({ createdAt: -1 });
        }

        // Apply limit if specified
        if (limit && !isNaN(parseInt(limit))) {
            query = query.limit(parseInt(limit));
        }

        const products = await query.exec();

        res.json(products);
    } catch (err) {
        next(err);
    }
};

// Get product by slug
exports.getProductBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        next(err);
    }
};

// Delete product
exports.deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        next(err);
    }
};

// Search products
exports.searchProducts = async (req, res, next) => {
    try {
        const { q, sort, priceRange, category, availability, rating } = req.query;

        if (!q || q.trim() === '') {
            return res.json([]);
        }

        // Build search query
        const searchQuery = {
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ]
        };

        // Add filters
        if (category) {
            searchQuery.categoryId = category;
        }

        if (availability === 'in-stock') {
            searchQuery.stock = { $gt: 0 };
        } else if (availability === 'out-of-stock') {
            searchQuery.stock = { $lte: 0 };
        }

        if (rating) {
            searchQuery.rating = { $gte: parseFloat(rating) };
        }

        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            if (max) {
                searchQuery.basePrice = { $gte: min, $lte: max };
            } else {
                searchQuery.basePrice = { $gte: min };
            }
        }

        // Build sort options
        let sortOptions = {};
        switch (sort) {
            case 'newest':
                sortOptions = { createdAt: -1 };
                break;
            case 'price-low':
                sortOptions = { basePrice: 1 };
                break;
            case 'price-high':
                sortOptions = { basePrice: -1 };
                break;
            case 'popular':
                sortOptions = { rating: -1, reviews: -1 };
                break;
            case 'relevance':
            default:
                // For relevance, we'll use text score if available, otherwise by name match
                sortOptions = { name: 1 };
                break;
        }

        // Execute search
        const products = await Product.find(searchQuery)
            .populate('categoryId', 'name slug')
            .sort(sortOptions)
            .limit(50); // Limit results for performance

        res.json(products);
    } catch (err) {
        next(err);
    }
};
