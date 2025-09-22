const mongoose = require('mongoose')

const mainCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true
        },
        order: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

// Create slug from name before saving (only if slug not provided)
mainCategorySchema.pre('save', function (next) {
    // Only generate slug if not provided
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }
    next()
})

module.exports = mongoose.model('MainCategory', mainCategorySchema)
