const mongoose = require('mongoose');

const kitchenLayoutSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['straight', 'l-shape', 'parallel']
  },
  name: { type: String, required: true },
  description: String,
  efficiency: String,
  suitableFor: [String], // e.g., ['small-spaces', 'corner-spaces', 'large-spaces']
  image: String
}, { _id: false });

const kitchenMaterialSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['cabinets', 'countertop', 'backsplash', 'flooring', 'hardware']
  },
  material: { type: String, required: true },
  quality: {
    type: String,
    enum: ['basic', 'good', 'better', 'best', 'premium'],
    default: 'good'
  },
  durability: String,
  priceRange: {
    min: Number,
    max: Number
  },
  features: [String],
  image: String
}, { _id: false });

const kitchenApplianceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['cooking', 'storage', 'cleaning', 'ventilation', 'utility']
  },
  essential: { type: Boolean, default: false },
  price: Number,
  brand: String,
  specifications: mongoose.Schema.Types.Mixed,
  image: String
}, { _id: false });

const kitchenFeatureSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['storage', 'lighting', 'hardware', 'organization', 'safety', 'convenience']
  },
  description: String,
  price: Number,
  image: String
}, { _id: false });

const kitchenVariantSchema = new mongoose.Schema({
  // Dynamic variant fields based on configuration
  fields: { type: mongoose.Schema.Types.Mixed, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number },
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  // Kitchen-specific configuration
  layout: kitchenLayoutSchema,
  materials: [kitchenMaterialSchema],
  appliances: [kitchenApplianceSchema],
  features: [kitchenFeatureSchema],
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  estimatedArea: Number // in sq ft
}, { _id: false });

const kitchenProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  mainImages: [{ type: String }],

  // Base pricing
  basePrice: { type: Number, required: true },
  mrp: { type: Number },
  discount: { type: Number },

  // Kitchen-specific fields
  category: {
    type: String,
    required: true,
    enum: ['modular-kitchen', 'kitchen-package', 'kitchen-accessories', 'kitchen-appliances'],
    default: 'modular-kitchen'
  },

  // Default kitchen configuration
  defaultLayout: kitchenLayoutSchema,
  defaultMaterials: [kitchenMaterialSchema],
  defaultAppliances: [kitchenApplianceSchema],
  defaultFeatures: [kitchenFeatureSchema],

  // Available options for customization
  availableLayouts: [kitchenLayoutSchema],
  availableMaterials: [kitchenMaterialSchema],
  availableAppliances: [kitchenApplianceSchema],
  availableFeatures: [kitchenFeatureSchema],

  // Variants system
  hasVariants: { type: Boolean, default: false },
  variants: [kitchenVariantSchema],
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

  // Kitchen-specific metadata
  kitchenMetadata: {
    suitableFor: [String], // e.g., ['1bhk', '2bhk', '3bhk', 'villa']
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

// Generate SKU for kitchen variants
kitchenProductSchema.methods.generateVariantSKU = function (variant) {
  const baseSlug = this.slug.substring(0, 3).toUpperCase();

  // Create SKU from variant fields
  const fieldValues = Object.values(variant.fields || {});
  const fieldCodes = fieldValues.map(value => {
    return String(value).substring(0, 2).toUpperCase();
  });

  return `KIT-${baseSlug}-${fieldCodes.join('-')}`;
};

// Calculate estimated area
kitchenProductSchema.methods.calculateArea = function (dimensions) {
  if (dimensions && dimensions.length && dimensions.width) {
    return dimensions.length * dimensions.width;
  }
  return null;
};

// Get price range for all variants
kitchenProductSchema.methods.getPriceRange = function () {
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
kitchenProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
kitchenProductSchema.index({ category: 1, isActive: 1 });
kitchenProductSchema.index({ 'kitchenMetadata.suitableFor': 1 });
kitchenProductSchema.index({ 'kitchenMetadata.style': 1 });
kitchenProductSchema.index({ basePrice: 1 });

module.exports = mongoose.model('KitchenProduct', kitchenProductSchema);

