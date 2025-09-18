const WardrobeProduct = require('../models/WardrobeProduct');
const { uploadBuffer } = require('../utils/cloudinary');

exports.createWardrobeProduct = async (req, res, next) => {
  try {
    const {
      name, slug, description, basePrice, mrp, discount, category,
      defaultOpening, defaultType, defaultMaterials, defaultFeatures,
      availableOpenings, availableTypes, availableMaterials, availableFeatures,
      hasVariants, variants, variantOptions, dynamicFields,
      wardrobeMetadata, metaData, tags
    } = req.body;

    const mainImages = [];
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        const uploaded = await uploadBuffer(file.buffer, `wardrobes/${slug || name}`);
        mainImages.push(uploaded.secure_url);
      }
    }

    const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

    const doc = await WardrobeProduct.create({
      name, slug, description, basePrice,
      mrp: mrp !== undefined && mrp !== '' ? parseFloat(mrp) : null,
      discount: discount !== undefined && discount !== '' ? parseFloat(discount) : null,
      category,
      mainImages,
      defaultOpening,
      defaultType,
      defaultMaterials: parseMaybe(defaultMaterials) || [],
      defaultFeatures: parseMaybe(defaultFeatures) || [],
      availableOpenings: parseMaybe(availableOpenings) || [],
      availableTypes: parseMaybe(availableTypes) || [],
      availableMaterials: parseMaybe(availableMaterials) || [],
      availableFeatures: parseMaybe(availableFeatures) || [],
      hasVariants: !!hasVariants,
      variants: parseMaybe(variants) || [],
      variantOptions: parseMaybe(variantOptions) || {},
      dynamicFields: parseMaybe(dynamicFields) || {},
      wardrobeMetadata: parseMaybe(wardrobeMetadata) || {},
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

exports.getWardrobeProducts = async (req, res, next) => {
  try {
    const { opening, type, suitableFor, style, colorScheme, priceMin, priceMax, sort, limit, search } = req.query;
    const filter = {};
    if (opening) filter.defaultOpening = { $in: Array.isArray(opening) ? opening : [opening] };
    if (type) filter.defaultType = { $in: Array.isArray(type) ? type : [type] };
    if (suitableFor) filter['wardrobeMetadata.suitableFor'] = { $in: JSON.parse(suitableFor) };
    if (style) filter['wardrobeMetadata.style'] = { $in: JSON.parse(style) };
    if (colorScheme) filter['wardrobeMetadata.colorScheme'] = { $in: JSON.parse(colorScheme) };
    if (priceMin || priceMax) {
      filter.basePrice = {};
      if (priceMin) filter.basePrice.$gte = parseFloat(priceMin);
      if (priceMax) filter.basePrice.$lte = parseFloat(priceMax);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let query = WardrobeProduct.find(filter);
    if (sort) {
      const map = { 'price-low': { basePrice: 1 }, 'price-high': { basePrice: -1 }, newest: { createdAt: -1 } };
      query = query.sort(map[sort] || { createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }
    if (limit && !isNaN(parseInt(limit))) query = query.limit(parseInt(limit));

    const items = await query.exec();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.getWardrobeProductBySlug = async (req, res, next) => {
  try {
    const item = await WardrobeProduct.findOne({ slug: req.params.slug });
    if (!item) return res.status(404).json({ message: 'Wardrobe product not found' });
    item.views += 1;
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

exports.updateWardrobeProduct = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;
    ['defaultMaterials','defaultFeatures','availableTypes','availableMaterials','availableFeatures','variants','variantOptions','dynamicFields','wardrobeMetadata','metaData']
      .forEach(k => { if (updates[k] !== undefined) updates[k] = parseMaybe(updates[k]); });

    if (req.files && req.files.images) {
      updates.mainImages = [];
      for (const file of req.files.images) {
        const uploaded = await uploadBuffer(file.buffer, `wardrobes/${updates.slug || req.params.id}`);
        updates.mainImages.push(uploaded.secure_url);
      }
    }

    const item = await WardrobeProduct.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ message: 'Wardrobe product not found' });
    if (updates.variants) {
      item.variants = updates.variants.map(v => ({ ...v, sku: item.generateVariantSKU(v) }));
      await item.save();
    }
    res.json(item);
  } catch (err) { next(err); }
};

exports.deleteWardrobeProduct = async (req, res, next) => {
  try {
    const deleted = await WardrobeProduct.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Wardrobe product not found' });
    res.json({ message: 'Wardrobe product deleted successfully' });
  } catch (err) { next(err); }
};


