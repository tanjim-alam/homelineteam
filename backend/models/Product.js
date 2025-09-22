const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema(
	{
		title: String,
		description: String,
		keywords: [String],
		ogImage: String,
	},
	{ _id: false }
);

const variantSchema = new mongoose.Schema(
	{
		// Dynamic variant fields - will be populated based on category.variantFields
		fields: { type: mongoose.Schema.Types.Mixed, required: true }, // e.g., { height: "100cm", width: "50cm", lining: "No Lining" }
		price: { type: Number, required: true },
		mrp: { type: Number },
		discount: { type: Number },
		stock: { type: Number, default: 0 },
		sku: { type: String, unique: true, sparse: true },
		images: [{ type: String }], // variant-specific images
		isActive: { type: Boolean, default: true }
	},
	{ _id: false }
);

const productSchema = new mongoose.Schema(
	{
		categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
		name: { type: String, required: true },
		slug: { type: String, required: true, unique: true, index: true },
		basePrice: { type: Number, required: true }, // base price for the product
		mrp: { type: Number }, // Maximum Retail Price
		discount: { type: Number }, // Discount percentage
		description: { type: String }, // rich text HTML
		mainImages: [{ type: String }], // main product images
		// dynamicFields stores key-value pairs based on category customFields slugs
		dynamicFields: { type: mongoose.Schema.Types.Mixed, default: {} },
		// variantOptions stores available options for each variant field (e.g., { height: ["4 ft", "5 ft"], width: ["2 ft", "3 ft"] })
		variantOptions: { type: mongoose.Schema.Types.Mixed, default: {} },
		metaData: metaSchema,
		// Variants system for different combinations
		variants: [variantSchema],
		// Whether this product uses variants
		hasVariants: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

// Generate SKU for variants based on dynamic fields
productSchema.methods.generateVariantSKU = function (variant) {
	const baseSlug = this.slug.substring(0, 3).toUpperCase();

	// Create SKU from variant fields
	const fieldValues = Object.values(variant.fields || {});
	const fieldCodes = fieldValues.map(value => {
		// Take first 2 characters of each field value
		return String(value).substring(0, 2).toUpperCase();
	});

	return `${baseSlug}-${fieldCodes.join('-')}`;
};

module.exports = mongoose.model('Product', productSchema);


