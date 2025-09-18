const mongoose = require('mongoose');

const packageFeatureSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['kitchen', 'wardrobe', 'general', 'appliance', 'storage', 'lighting']
    },
    description: String,
    price: Number,
    image: String
}, { _id: false });

const packageInclusionSchema = new mongoose.Schema({
    item: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    description: String,
    category: {
        type: String,
        enum: ['kitchen', 'wardrobe', 'appliance', 'furniture', 'lighting', 'hardware'],
        required: true
    },
    price: Number,
    image: String
}, { _id: false });

const packageVariantSchema = new mongoose.Schema({
    // Dynamic variant fields based on configuration
    fields: { type: mongoose.Schema.Types.Mixed, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    discount: { type: Number },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    // Package-specific configuration
    kitchenLayout: String,
    wardrobeType: String,
    materials: [String],
    features: [packageFeatureSchema],
    inclusions: [packageInclusionSchema],
    dimensions: {
        totalArea: Number, // in sq ft
        kitchenArea: Number,
        bedroomArea: Number
    },
    estimatedDelivery: String
}, { _id: false });

const oneBHKPackageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    mainImages: [{ type: String }],

    // Base pricing
    basePrice: { type: Number, required: true },
    mrp: { type: Number },
    discount: { type: Number },

    // Package-specific fields
    category: {
        type: String,
        required: true,
        enum: ['1bhk-package', '1bhk-premium', '1bhk-budget', '1bhk-luxury'],
        default: '1bhk-package'
    },

    // Package configuration
    kitchenLayout: {
        type: String,
        enum: ['straight', 'l-shape', 'parallel'],
        required: true
    },
    wardrobeType: {
        type: String,
        enum: ['2-door', '3-door', '4-door'],
        required: true
    },

    // Package details
    materials: [String],
    features: [packageFeatureSchema],
    inclusions: [packageInclusionSchema],

    // Available options for customization
    availableLayouts: [String],
    availableWardrobeTypes: [String],
    availableMaterials: [String],
    availableFeatures: [packageFeatureSchema],

    // Variants system
    hasVariants: { type: Boolean, default: false },
    variants: [packageVariantSchema],
    variantOptions: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Dynamic fields for additional customization
    dynamicFields: { type: mongoose.Schema.Types.Mixed, default: {} },

    // SEO and metadata
    metaData: {
        title: String,
        description: String,
        keywords: [String],
        ogImage: String
    },

    // Package-specific metadata
    packageMetadata: {
        suitableFor: [String], // e.g., ['1bhk', 'studio', 'small-apartment']
        style: [String], // e.g., ['modern', 'traditional', 'contemporary', 'minimalist']
        colorScheme: [String], // e.g., ['white', 'wood', 'grey', 'colorful']
        budget: {
            min: Number,
            max: Number
        },
        deliveryTime: String, // e.g., '15-20 days'
        warranty: String,
        installation: {
            included: Boolean,
            cost: Number
        },
        area: {
            min: Number, // minimum area in sq ft
            max: Number  // maximum area in sq ft
        }
    },

    // Status and visibility
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],

    // Analytics
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Generate SKU for package variants
oneBHKPackageSchema.methods.generateVariantSKU = function (variant) {
    const baseSlug = this.slug.substring(0, 3).toUpperCase();

    // Create SKU from variant fields
    const fieldValues = Object.values(variant.fields || {});
    const fieldCodes = fieldValues.map(value => {
        return String(value).substring(0, 2).toUpperCase();
    });

    return `1BH-${baseSlug}-${fieldCodes.join('-')}`;
};

// Calculate estimated area
oneBHKPackageSchema.methods.calculateArea = function (dimensions) {
    if (dimensions && dimensions.totalArea) {
        return dimensions.totalArea;
    }
    return null;
};

// Get price range for all variants
oneBHKPackageSchema.methods.getPriceRange = function () {
    if (!this.hasVariants || !this.variants.length) {
        return {
            min: this.basePrice,
            max: this.basePrice
        };
    }

    const prices = this.variants.map(v => v.price).filter(p => p);
    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
};

// Index for better search performance
oneBHKPackageSchema.index({ name: 'text', description: 'text', tags: 'text' });
oneBHKPackageSchema.index({ category: 1, isActive: 1 });
oneBHKPackageSchema.index({ 'packageMetadata.suitableFor': 1 });
oneBHKPackageSchema.index({ 'packageMetadata.style': 1 });
oneBHKPackageSchema.index({ basePrice: 1 });

module.exports = mongoose.model('OneBHKPackage', oneBHKPackageSchema);
