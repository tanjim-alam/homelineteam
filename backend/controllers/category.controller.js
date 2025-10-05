const Category = require('../models/Category');
const { uploadBuffer } = require('../utils/cloudinary');

// Create category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, seoContent, mainCategoryId, order } = req.body;

    // Validate required fields
    if (!name || !slug) {
      const err = new Error('Name and slug are required');
      err.statusCode = 400;
      throw err;
    }

    // Check duplicates by name (case-insensitive) or slug before creating
    const existing = await Category.findOne({
      $or: [
        { slug },
        { name: { $regex: new RegExp(`^${name}$`, 'i') } }
      ]
    });
    if (existing) {
      const err = new Error('Category with this name or slug already exists');
      err.statusCode = 409;
      throw err;
    }

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


    let imageUrl;

    // ✅ Handle main image
    if (req.files && req.files.image) {
      const mainImageFile = req.files.image[0];
      const uploaded = await uploadBuffer(mainImageFile.buffer, `categories/${slug || name}`);
      imageUrl = uploaded.secure_url;
    }

    // ✅ Handle Open Graph image
    if (req.files && req.files['metaData[ogImage]']) {
      const ogImageFile = req.files['metaData[ogImage]'][0];
      const uploaded = await uploadBuffer(ogImageFile.buffer, `categories/og-images/${slug || name}`);
      metaData.ogImage = uploaded.secure_url;
    }

    // Save category
    const category = await Category.create({
      name,
      slug,
      description,
      image: imageUrl,
      metaData,
      seoContent,
      mainCategoryId,
      order: order || 0
    });

    // Category created successfully
    res.status(201).json(category);
  } catch (err) {
    // Handle duplicate key error gracefully
    if (err && (err.code === 11000 || /E11000 duplicate key/.test(err.message || ''))) {
      err.statusCode = 409;
      err.message = 'Category with this slug already exists';
    }
    next(err);
  }
};

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate('mainCategoryId', 'name slug order').sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Get main categories only
exports.getMainCategories = async (req, res, next) => {
  try {
    const MainCategory = require('../models/MainCategory');
    const categories = await MainCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Get all subcategories with main category data
exports.getSubcategories = async (req, res, next) => {
  try {
    const subcategories = await Category.find({
      isActive: true
    }).populate('mainCategoryId', 'name slug order').sort({ order: 1, createdAt: -1 });
    res.json(subcategories);
  } catch (err) {
    next(err);
  }
};

// Get all categories with populated main category data
exports.getCategoriesWithMainCategory = async (req, res, next) => {
  try {
    const categories = await Category.find({
      isActive: true
    }).populate('mainCategoryId', 'name slug order').sort({ order: 1, createdAt: -1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Get subcategories by main category
exports.getSubcategoriesByMainCategory = async (req, res, next) => {
  try {
    const { mainCategoryId } = req.params;
    const subcategories = await Category.find({
      mainCategoryId: mainCategoryId,
      isActive: true
    }).populate('mainCategoryId', 'name slug').sort({ order: 1, createdAt: -1 });
    res.json(subcategories);
  } catch (err) {
    next(err);
  }
};

// Get hierarchical categories (main categories with their subcategories)
exports.getHierarchicalCategories = async (req, res, next) => {
  try {
    const MainCategory = require('../models/MainCategory');

    // Step 1: Get all main categories from MainCategory model
    const mainCategories = await MainCategory.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    // Step 2: For each main category, fetch its subcategories from Category model
    const hierarchicalData = await Promise.all(
      mainCategories.map(async (mainCategory) => {
        // Get subcategories from Category model that reference this main category
        const subcategories = await Category.find({
          mainCategoryId: mainCategory._id
        }).populate('mainCategoryId', 'name slug order').sort({ order: 1, createdAt: -1 });

        return {
          _id: mainCategory._id,
          name: mainCategory.name,
          slug: mainCategory.slug,
          order: mainCategory.order,
          isActive: mainCategory.isActive,
          createdAt: mainCategory.createdAt,
          updatedAt: mainCategory.updatedAt,
          subcategories: subcategories
        };
      })
    );

    res.json(hierarchicalData);
  } catch (err) {
    next(err);
  }
};

// Get category by slug
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Get filter options for a category
exports.getCategoryFilterOptions = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get all products in this category to extract filter options
    const Product = require('../models/Product');
    const products = await Product.find({ categoryId: category._id });

    // Extract only essential filter options
    const filterOptions = {
      // Price range from products
      priceRange: products.length > 0 ? {
        min: Math.min(...products.map(p => p.basePrice || 0)),
        max: Math.max(...products.map(p => p.basePrice || 0))
      } : { min: 0, max: 1000 },

      // Brands from dynamic fields (if they exist)
      brands: [],

      // Ratings (if implemented)
      ratings: [5, 4, 3, 2, 1],

      // Availability based on stock
      availability: ['In Stock', 'Out of Stock', 'Pre-order'],

      // Only show the most important custom fields as filters
      importantFilters: {}
    };

    // Extract brand information if it exists in dynamic fields
    const brandField = category.customFields?.find(field =>
      field.slug === 'brand' || field.name.toLowerCase().includes('brand')
    );

    if (brandField) {
      const brands = new Set();
      products.forEach(product => {
        if (product.dynamicFields?.brand) {
          brands.add(product.dynamicFields.brand);
        }
      });
      filterOptions.brands = Array.from(brands).sort();
    }

    // Extract only the most important filter options (max 3-4 filters)
    const importantFields = [];

    // Add material if it exists
    const materialField = category.customFields?.find(field =>
      field.slug === 'material' || field.name.toLowerCase().includes('material')
    );
    if (materialField) {
      importantFields.push({
        key: 'material',
        name: materialField.name,
        options: materialField.options || []
      });
    }

    // Add style if it exists
    const styleField = category.customFields?.find(field =>
      field.slug === 'style' || field.name.toLowerCase().includes('style')
    );
    if (styleField) {
      importantFields.push({
        key: 'style',
        name: styleField.name,
        options: styleField.options || []
      });
    }

    // Add color if it exists
    const colorField = category.customFields?.find(field =>
      field.slug === 'color' || field.name.toLowerCase().includes('color')
    );
    if (colorField) {
      importantFields.push({
        key: 'color',
        name: colorField.name,
        options: colorField.options || []
      });
    }

    // Add one most important variant field if it exists
    if (category.variantFields && category.variantFields.length > 0) {
      const mainVariantField = category.variantFields[0]; // Take the first one
      const values = new Set();
      products.forEach(product => {
        if (product.variantOptions?.[mainVariantField.slug]) {
          product.variantOptions[mainVariantField.slug].forEach(value => {
            values.add(value);
          });
        }
      });

      if (values.size > 0) {
        importantFields.push({
          key: mainVariantField.slug,
          name: mainVariantField.name,
          unit: mainVariantField.unit,
          options: Array.from(values).sort()
        });
      }
    }

    // Limit to maximum 4 important filters
    filterOptions.importantFilters = importantFields.slice(0, 4);

    res.json(filterOptions);
  } catch (err) {
    next(err);
  }
};

// Update category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, seoContent, mainCategoryId, order } = req.body;


    const updates = { name, slug, description, seoContent };

    // Add mainCategoryId and order to updates if provided
    if (mainCategoryId !== undefined) {
      updates.mainCategoryId = mainCategoryId;
    }
    if (order !== undefined) {
      updates.order = order;
    }

    // ✅ Handle nested metaData object (new approach)
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
      // ✅ Handle FormData fields for metaData (fallback approach)
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
        // Convert keywords string to array if it's not empty
        const keywordsString = req.body['metaData[keywords]'] || '';
        if (keywordsString && keywordsString.trim()) {
          updates.metaData.keywords = keywordsString.split(',').map(k => k.trim()).filter(k => k);
        } else {
          updates.metaData.keywords = [];
        }
      }
    }


    // ✅ Handle main image update
    if (req.files && req.files.image) {
      const mainImageFile = req.files.image[0];
      const uploaded = await uploadBuffer(mainImageFile.buffer, `categories/${slug || id}`);
      updates.image = uploaded.secure_url;
    }

    // ✅ Handle Open Graph image update
    if (req.files && req.files['metaData[ogImage]']) {
      const ogImageFile = req.files['metaData[ogImage]'][0];
      const uploaded = await uploadBuffer(ogImageFile.buffer, `categories/og-images/${slug || id}`);
      updates.metaData = updates.metaData || {};
      updates.metaData.ogImage = uploaded.secure_url;
    }

    // Use $set operator for nested updates to ensure proper MongoDB update
    const updateQuery = {};
    Object.keys(updates).forEach(key => {
      if (key === 'metaData' && updates.metaData) {
        // Handle nested metaData updates properly
        Object.keys(updates.metaData).forEach(metaKey => {
          updateQuery[`metaData.${metaKey}`] = updates.metaData[metaKey];
        });
      } else {
        updateQuery[key] = updates[key];
      }
    });


    const category = await Category.findByIdAndUpdate(id, { $set: updateQuery }, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Category updated successfully

    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Add new field to existing category
exports.addCustomField = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, type, options, required, visibleOnProduct } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { $push: { customFields: { name, slug, type, options, required, visibleOnProduct } } },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Add new variant field to existing category
exports.addVariantField = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, type, options, required, unit, order } = req.body;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { $push: { variantFields: { name, slug, type, options, required, unit, order } } },
      { new: true }
    );

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Delete category
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({
      success: true,
      message: 'Category deleted successfully',
      _id: id
    });
  } catch (err) {
    next(err);
  }
};
