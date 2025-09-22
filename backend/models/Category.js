const mongoose = require('mongoose');

// Schema for custom fields definition at category level
const customFieldSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true },
		type: {
			type: String,
			enum: ['text', 'number', 'dropdown', 'multi-select', 'boolean', 'image', 'rich-text'],
			required: true,
		},
		options: [{ type: String }], // for dropdown / multi-select
		required: { type: Boolean, default: false },
		visibleOnProduct: { type: Boolean, default: true },
	},
	{ _id: false }
);

// Schema for variant field definitions at category level
const variantFieldSchema = new mongoose.Schema(
	{
		name: { type: String, required: true }, // e.g., "Height", "Width", "Lining"
		slug: { type: String, required: true }, // e.g., "height", "width", "lining"
		type: {
			type: String,
			enum: ['text', 'number', 'dropdown', 'multi-select'],
			required: true,
		},
		options: [{ type: String }], // for dropdown / multi-select
		required: { type: Boolean, default: false },
		unit: { type: String }, // e.g., "cm", "inches", "ft"
		order: { type: Number, default: 0 }, // for display order
	},
	{ _id: false }
);

const metaSchema = new mongoose.Schema(
	{
		title: String,
		description: String,
		keywords: [String],
		ogImage: String,
	},
	{ _id: false }
);

const categorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true, unique: true, index: true },
		image: { type: String },
		seoContent: { type: String }, // rich text (HTML)
		metaData: metaSchema,
		customFields: [customFieldSchema],
		variantFields: [variantFieldSchema], // New: Define variant structure per category
		// Reference to main category
		mainCategoryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'MainCategory',
			required: true
		},
		order: { type: Number, default: 0 }, // For display ordering
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);


