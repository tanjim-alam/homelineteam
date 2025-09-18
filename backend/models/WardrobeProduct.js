const mongoose = require('mongoose');

const wardrobeDimensionSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  depth: Number
}, { _id: false });

const wardrobeMaterialSchema = new mongoose.Schema({
  category: { type: String, enum: ['carcass', 'shutter', 'finish', 'hardware'], required: true },
  material: { type: String, required: true },
  color: String,
  texture: String,
  priceRange: { min: Number, max: Number }
}, { _id: false });

const wardrobeFeatureSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['storage', 'hardware', 'lighting', 'organization', 'safety'], required: true },
  description: String,
  price: Number
}, { _id: false });

const wardrobeVariantSchema = new mongoose.Schema({
  fields: mongoose.Schema.Types.Mixed,
  price: { type: Number, required: true },
  mrp: Number,
  discount: Number,
  stock: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  images: [String],
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['2-door', '3-door', '4-door', '5-door', 'sliding'], required: true },
  materials: [wardrobeMaterialSchema],
  features: [wardrobeFeatureSchema],
  dimensions: wardrobeDimensionSchema
}, { _id: false });

const wardrobeProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: String,
  mainImages: [String],
  basePrice: { type: Number, required: true },
  mrp: Number,
  discount: Number,
  category: { type: String, enum: ['wardrobe', 'wardrobe-package'], default: 'wardrobe', required: true },
  // Opening type: sliding or swinging
  defaultOpening: { type: String, enum: ['sliding', 'swinging'] },
  availableOpenings: [String],
  // High-level type by door count or category
  defaultType: { type: String, enum: ['2-door', '3-door', '4-door', '5-door', 'sliding'] },
  defaultMaterials: [wardrobeMaterialSchema],
  defaultFeatures: [wardrobeFeatureSchema],
  availableTypes: [String],
  availableMaterials: [wardrobeMaterialSchema],
  availableFeatures: [wardrobeFeatureSchema],
  hasVariants: { type: Boolean, default: false },
  variants: [wardrobeVariantSchema],
  variantOptions: mongoose.Schema.Types.Mixed,
  dynamicFields: mongoose.Schema.Types.Mixed,
  metaData: { title: String, description: String, keywords: [String], ogImage: String },
  wardrobeMetadata: {
    suitableFor: [String],
    style: [String],
    colorScheme: [String],
    deliveryTime: String,
    warranty: String
  },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 }
}, { timestamps: true });

wardrobeProductSchema.methods.generateVariantSKU = function(variant) {
  const baseSlug = this.slug.substring(0,3).toUpperCase();
  const fields = Object.values(variant.fields || {}).map(v => String(v).substring(0,2).toUpperCase()).join('-');
  return `WRD-${baseSlug}-${fields}`;
};

wardrobeProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
wardrobeProductSchema.index({ category: 1, isActive: 1 });
wardrobeProductSchema.index({ basePrice: 1 });

module.exports = mongoose.model('WardrobeProduct', wardrobeProductSchema);


