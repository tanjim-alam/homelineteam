const MainCategory = require('../models/MainCategory')
const Category = require('../models/Category')
const Product = require('../models/Product')

// Create main category
const createMainCategory = async (req, res) => {
    try {
        const { name, slug, order = 0, isActive = true } = req.body

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            })
        }

        // Generate slug if not provided
        const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Check if main category already exists
        const existingCategory = await MainCategory.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${name}$`, 'i') } },
                { slug: finalSlug }
            ]
        })

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Main category with this name or slug already exists'
            })
        }

        const mainCategory = new MainCategory({
            name,
            slug: finalSlug,
            order,
            isActive
        })

        await mainCategory.save()

        res.status(201).json({
            success: true,
            message: 'Main category created successfully',
            data: mainCategory
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create main category',
            error: error.message
        })
    }
}

// Get all main categories
const getMainCategories = async (req, res) => {
    try {
        const { active = true } = req.query

        const query = {}
        if (active === 'true') {
            query.isActive = true
        }

        const mainCategories = await MainCategory.find(query)
            .sort({ order: 1, name: 1 })

        res.json({
            success: true,
            data: mainCategories
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch main categories',
            error: error.message
        })
    }
}

// Get main category by ID
const getMainCategoryById = async (req, res) => {
    try {
        const { id } = req.params

        const mainCategory = await MainCategory.findById(id)
        if (!mainCategory) {
            return res.status(404).json({
                success: false,
                message: 'Main category not found'
            })
        }

        res.json({
            success: true,
            data: mainCategory
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch main category',
            error: error.message
        })
    }
}

// Update main category
const updateMainCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name, order, isActive } = req.body

        const mainCategory = await MainCategory.findById(id)
        if (!mainCategory) {
            return res.status(404).json({
                success: false,
                message: 'Main category not found'
            })
        }

        // Check if name is being changed and if it conflicts
        if (name && name !== mainCategory.name) {
            const existingCategory = await MainCategory.findOne({
                _id: { $ne: id },
                $or: [
                    { name: { $regex: new RegExp(`^${name}$`, 'i') } },
                    { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
                ]
            })

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Main category with this name already exists'
                })
            }
        }

        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (order !== undefined) updateData.order = order
        if (isActive !== undefined) updateData.isActive = isActive

        const updatedMainCategory = await MainCategory.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        )

        res.json({
            success: true,
            message: 'Main category updated successfully',
            data: updatedMainCategory
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update main category',
            error: error.message
        })
    }
}

// Delete main category
const deleteMainCategory = async (req, res) => {
    try {
        const { id } = req.params

        // Check if main category has subcategories
        const subcategories = await Category.find({ mainCategoryId: id })
        if (subcategories.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete main category with existing subcategories'
            })
        }

        // Check if main category has products
        const products = await Product.find({ mainCategoryId: id })
        if (products.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete main category with existing products'
            })
        }

        const mainCategory = await MainCategory.findByIdAndDelete(id)
        if (!mainCategory) {
            return res.status(404).json({
                success: false,
                message: 'Main category not found'
            })
        }

        res.json({
            success: true,
            message: 'Main category deleted successfully'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete main category',
            error: error.message
        })
    }
}

// Get main category with subcategories
const getMainCategoryWithSubcategories = async (req, res) => {
    try {
        const { id } = req.params

        const mainCategory = await MainCategory.findById(id)
        if (!mainCategory) {
            return res.status(404).json({
                success: false,
                message: 'Main category not found'
            })
        }

        const subcategories = await Category.find({
            mainCategoryId: id,
            isActive: true
        }).sort({ order: 1, name: 1 })

        res.json({
            success: true,
            data: {
                ...mainCategory.toObject(),
                subcategories
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch main category with subcategories',
            error: error.message
        })
    }
}

module.exports = {
    createMainCategory,
    getMainCategories,
    getMainCategoryById,
    updateMainCategory,
    deleteMainCategory,
    getMainCategoryWithSubcategories
}
