import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addCustomField,
  addVariantField,
  clearError
} from '../store/slices/categorySlice'
import api from '../api/client'
import RichTextEditor from '../components/RichTextEditor'
import {
  Plus,
  FolderOpen,
  AlertCircle,
  CheckCircle,
  X,
  Edit3,
  Trash2,
  Settings,
  Tag,
  FileText,
  ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react'

export default function CategoriesPage() {
  const dispatch = useDispatch()
  const { items, loading, error, createLoading, updateLoading } = useSelector(s => s.categories)

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false)
  const [showVariantFieldForm, setShowVariantFieldForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [subCategories, setSubCategories] = useState([])
  const [mainCategories, setMainCategories] = useState([])
  const [mainCategoriesLoading, setMainCategoriesLoading] = useState(false)
  const [showMainCategoryModal, setShowMainCategoryModal] = useState(false)
  const [editingMainCategory, setEditingMainCategory] = useState(null)
  const [mainCategoryForm, setMainCategoryForm] = useState({
    name: '',
    slug: ''
  })

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: null,
    imagePreview: null,
    seoContent: '',
    order: 0,
    mainCategoryId: '',
    metaData: {
      title: '',
      description: '',
      keywords: '',
      ogImage: ''
    }
  })


  const [customFieldForm, setCustomFieldForm] = useState({
    name: '',
    slug: '',
    type: 'text',
    options: [''],
    required: false,
    visibleOnProduct: true
  })

  const [variantFieldForm, setVariantFieldForm] = useState({
    name: '',
    slug: '',
    type: 'dropdown',
    options: [''],
    required: false,
    unit: '',
    order: 1
  })

  useEffect(() => {
    fetchCategories()
    fetchMainCategories()
  }, [])

  // Show all categories
  const allCategories = subCategories




  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories')

      if (response.data) {
        setSubCategories(response.data)
      } else {
        setSubCategories([])
      }
    } catch (error) {
      setSubCategories([])
    }
  }

  // Fetch main categories
  const fetchMainCategories = async () => {
    try {
      setMainCategoriesLoading(true)
      const response = await api.get('/api/main-categories')

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setMainCategories(response.data.data)
      } else {
        setMainCategories([])
      }
    } catch (error) {
      setMainCategories([])
    } finally {
      setMainCategoriesLoading(false)
    }
  }





  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const createCategory = async (formData) => {
    try {
      const response = await api.post('/api/categories', formData)

      if (response.data) {
        // Refresh categories
        await fetchCategories()
        return response.data
      } else {
        setErrorMessage('Failed to create category')
        setTimeout(() => setErrorMessage(''), 5000)
        throw new Error('Failed to create category')
      }
    } catch (error) {
      setErrorMessage('Error creating category: ' + (error.response?.data?.message || error.message))
      setTimeout(() => setErrorMessage(''), 5000)
      throw error
    }
  }

  // Create main category
  const createMainCategory = async (mainCategoryData) => {
    try {
      const response = await api.post('/api/main-categories', mainCategoryData)

      if (response.data && response.data.success) {
        // Refresh main categories
        await fetchMainCategories()
        return response.data
      } else {
        setErrorMessage('Failed to create main category')
        setTimeout(() => setErrorMessage(''), 5000)
        throw new Error('Failed to create main category')
      }
    } catch (error) {
      setErrorMessage('Error creating main category: ' + (error.response?.data?.message || error.message))
      setTimeout(() => setErrorMessage(''), 5000)
      throw error
    }
  }

  // Update main category
  const updateMainCategory = async (id, mainCategoryData) => {
    try {
      const response = await api.put(`/api/main-categories/${id}`, mainCategoryData)

      if (response.data && response.data.success) {
        // Refresh main categories
        await fetchMainCategories()
        return response.data
      } else {
        setErrorMessage('Failed to update main category')
        setTimeout(() => setErrorMessage(''), 5000)
        throw new Error('Failed to update main category')
      }
    } catch (error) {
      setErrorMessage('Error updating main category: ' + (error.response?.data?.message || error.message))
      setTimeout(() => setErrorMessage(''), 5000)
      throw error
    }
  }

  // Delete main category
  const deleteMainCategory = async (id) => {
    try {
      const response = await api.delete(`/api/main-categories/${id}`)

      if (response.data && response.data.success) {
        // Refresh main categories
        await fetchMainCategories()
        return response.data
      } else {
        setErrorMessage('Failed to delete main category')
        setTimeout(() => setErrorMessage(''), 5000)
        throw new Error('Failed to delete main category')
      }
    } catch (error) {
      setErrorMessage('Error deleting main category: ' + (error.response?.data?.message || error.message))
      setTimeout(() => setErrorMessage(''), 5000)
      throw error
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData()

    // Append basic fields
    formData.append('name', form.name)
    formData.append('slug', form.slug)
    formData.append('description', form.description)
    formData.append('seoContent', form.seoContent)
    formData.append('order', form.order.toString())
    formData.append('mainCategoryId', form.mainCategoryId)
    formData.append('type', 'sub')

    // Append SEO metadata
    formData.append('metaData[title]', form.metaData.title || '')
    formData.append('metaData[description]', form.metaData.description || '')
    formData.append('metaData[keywords]', form.metaData.keywords || '')
    if (form.metaData.ogImage) {
      formData.append('metaData[ogImage]', form.metaData.ogImage)
    }

    // Append image
    if (form.image) {
      formData.append('image', form.image)
    }

    if (editingCategory) {
      dispatch(updateCategory({ id: editingCategory._id, payload: formData }))
        .then(() => {
          setSuccessMessage('Category updated successfully!')
          setTimeout(() => {
            setSuccessMessage('')
            resetForm()
            setShowForm(false)
          }, 2000)
        })
        .catch(() => {
          // Error handling is done by Redux
        })
    } else {
      // Create category using new endpoint
      createCategory(formData)
        .then(() => {
          setSuccessMessage('Category created successfully!')
          setTimeout(() => {
            setSuccessMessage('')
            resetForm()
            setShowForm(false)
          }, 2000)
        })
        .catch(() => {
          // Error handling is done in createCategory
        })
    }
  }

  // Helper function to open form and scroll to top
  const openFormAndScrollToTop = () => {
    setShowForm(true)
    // Scroll to top when form opens
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Helper function to open custom field form and scroll to top
  const openCustomFieldFormAndScrollToTop = (category) => {
    setSelectedCategory(category)
    setShowCustomFieldForm(true)
    // Scroll to top when form opens
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Helper function to open variant field form and scroll to top
  const openVariantFieldFormAndScrollToTop = (category) => {
    setSelectedCategory(category)
    setShowVariantFieldForm(true)
    // Scroll to top when form opens
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image: null,
      imagePreview: category.image || null, // Set existing image as preview
      seoContent: category.seoContent || '',
      order: category.order || 0,
      mainCategoryId: category.mainCategoryId || '',
      metaData: {
        title: category.metaData?.title || '',
        description: category.metaData?.description || '',
        keywords: Array.isArray(category.metaData?.keywords) ? category.metaData.keywords.join(', ') : (category.metaData?.keywords || ''),
        ogImage: category.metaData?.ogImage || ''
      }
    })
    openFormAndScrollToTop()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await dispatch(deleteCategory(id)).unwrap()
        // Refresh the category list after successful deletion
        await fetchCategories()
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  const handleCustomFieldSubmit = (e) => {
    e.preventDefault()
    if (selectedCategory) {
      dispatch(addCustomField({
        id: selectedCategory._id,
        payload: customFieldForm
      }))
      setCustomFieldForm({
        name: '',
        slug: '',
        type: 'text',
        options: [''],
        required: false,
        visibleOnProduct: true
      })
      setShowCustomFieldForm(false)
    }
  }

  const handleVariantFieldSubmit = (e) => {
    e.preventDefault()
    if (selectedCategory) {
      // Add variant field to category using the API
      dispatch(addVariantField({
        id: selectedCategory._id,
        payload: variantFieldForm
      }))

      setVariantFieldForm({
        name: '',
        slug: '',
        type: 'dropdown',
        options: [''],
        required: false,
        unit: '',
        order: 1
      })
      setShowVariantFieldForm(false)
    }
  }

  const resetForm = () => {
    const resetData = {
      name: '',
      slug: '',
      description: '',
      image: null,
      imagePreview: null,
      seoContent: '',
      order: 0,
      mainCategoryId: '',
      metaData: {
        title: '',
        description: '',
        keywords: '',
        ogImage: ''
      }
    };
    setForm(resetData);
    setEditingCategory(null);
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm({ ...form, image: file, imagePreview: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const addOption = () => {
    setCustomFieldForm({
      ...customFieldForm,
      options: [...customFieldForm.options, '']
    })
  }

  const removeOption = (index) => {
    const newOptions = customFieldForm.options.filter((_, i) => i !== index)
    setCustomFieldForm({ ...customFieldForm, options: newOptions })
  }

  const updateOption = (index, value) => {
    const newOptions = [...customFieldForm.options]
    newOptions[index] = value
    setCustomFieldForm({ ...customFieldForm, options: newOptions })
  }

  const generateSlug = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setForm({ ...form, slug })
  }

  // Handle main category creation/update
  const handleMainCategorySubmit = async (e) => {
    e.preventDefault()

    if (!mainCategoryForm.name.trim()) {
      setErrorMessage('Main category name is required')
      setTimeout(() => setErrorMessage(''), 5000)
      return
    }

    try {
      let slug = mainCategoryForm.slug

      // If slug is empty, generate it from name
      if (!slug || !slug.trim()) {
        slug = mainCategoryForm.name.toLowerCase().replace(/\s+/g, '-')
      }

      const mainCategoryData = {
        name: mainCategoryForm.name,
        slug: slug
      }

      if (editingMainCategory) {
        await updateMainCategory(editingMainCategory._id, mainCategoryData)
        setSuccessMessage('Main category updated successfully!')
      } else {
        await createMainCategory(mainCategoryData)
        setSuccessMessage('Main category created successfully!')
      }

      setTimeout(() => setSuccessMessage(''), 3000)

      // Reset form and close modal
      setMainCategoryForm({ name: '', slug: '' })
      setEditingMainCategory(null)
      setShowMainCategoryModal(false)
    } catch (error) {
      // Error handling is done in createMainCategory/updateMainCategory
    }
  }

  // Handle edit main category
  const handleEditMainCategory = (mainCategory) => {
    setEditingMainCategory(mainCategory)
    setMainCategoryForm({
      name: mainCategory.name,
      slug: mainCategory.slug
    })
    setShowMainCategoryModal(true)
  }

  // Handle delete main category
  const handleDeleteMainCategory = async (id) => {
    const mainCategory = mainCategories.find(mc => mc._id === id)
    const confirmMessage = `Are you sure you want to delete the main category "${mainCategory?.name}"?\n\nThis action cannot be undone and will fail if:\n• The main category has subcategories\n• The main category has products\n\nDo you want to continue?`

    if (window.confirm(confirmMessage)) {
      try {
        await deleteMainCategory(id)
        setSuccessMessage('Main category deleted successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        // Error handling is done in deleteMainCategory
        console.error('Delete main category error:', error)
      }
    }
  }

  // Generate slug for main category
  const generateMainCategorySlug = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setMainCategoryForm({ ...mainCategoryForm, slug })
  }

  // Check if main category can be deleted
  const canDeleteMainCategory = (mainCategoryId) => {
    // Check if any subcategories exist for this main category
    const hasSubcategories = subCategories.some(cat => cat.mainCategoryId === mainCategoryId)
    return !hasSubcategories
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
              Categories
            </h1>
            <p className="text-lg text-gray-600">Manage your product categories - add, edit, and organize your categories</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openFormAndScrollToTop}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create Category</span>
            </button>
          </div>
        </div>

        {/* Modern Success Alert */}
        {successMessage && (
          <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Error Message Alert */}
        {errorMessage && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Error Alert */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Category Form */}
        {showForm && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 relative">
            {/* Loading Overlay */}
            {(createLoading || updateLoading) && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-700 font-semibold">
                    {createLoading ? 'Creating category...' : 'Updating category...'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-2xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Category Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onBlur={() => generateSlug(form.name)}
                      placeholder="Category Name"
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Category Slug *</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">URL-friendly version of the category name</p>
                  </div>


                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Main Category *</label>
                    <div className="flex gap-3">
                      <select
                        value={form.mainCategoryId}
                        onChange={(e) => setForm({ ...form, mainCategoryId: e.target.value })}
                        className="flex-1 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        required
                        disabled={mainCategoriesLoading}
                      >
                        <option value="">
                          {mainCategoriesLoading ? 'Loading main categories...' : 'Select a main category'}
                        </option>
                        {Array.isArray(mainCategories) && mainCategories.map((mainCategory) => (
                          <option key={mainCategory._id} value={mainCategory._id}>
                            {mainCategory.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowMainCategoryModal(true)}
                        className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Select existing main category or create a new one</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Display Order</label>
                    <input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">Lower numbers appear first in lists</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Description (Rich Text)</label>
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
                      <RichTextEditor
                        value={form.description}
                        onChange={(value) => setForm({ ...form, description: value })}
                        placeholder="Enter a detailed description of the category with rich formatting"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Use the rich text editor to format your category description with headings, lists, links, and more.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Category Image</label>

                    {/* Image Preview */}
                    {form.imagePreview && (
                      <div className="mb-4">
                        <div className="relative inline-block">
                          <img
                            src={form.imagePreview}
                            alt="Category preview"
                            className="w-36 h-36 object-cover rounded-3xl border-2 border-white/30 shadow-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image: null, imagePreview: null })}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Click the X to remove this image</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">Upload a category image (JPG, PNG, GIF - Max 5MB)</p>
                  </div>
                </div>

                {/* SEO Metadata */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Meta Title</label>
                    <input
                      type="text"
                      value={form.metaData.title}
                      onChange={(e) => setForm({
                        ...form,
                        metaData: { ...form.metaData, title: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      placeholder="SEO title for search engines"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">Recommended: 50-60 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Meta Description</label>
                    <textarea
                      value={form.metaData.description}
                      onChange={(e) => setForm({
                        ...form,
                        metaData: { ...form.metaData, description: e.target.value }
                      })}
                      rows={3}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      placeholder="SEO description for search engines"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">Recommended: 150-160 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Meta Keywords</label>
                    <input
                      type="text"
                      value={form.metaData.keywords}
                      onChange={(e) => setForm({
                        ...form,
                        metaData: { ...form.metaData, keywords: e.target.value }
                      })}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      placeholder="Keywords separated by commas"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">Comma-separated keywords for SEO</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Open Graph Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          setForm({
                            ...form,
                            metaData: { ...form.metaData, ogImage: file }
                          })
                        }
                      }}
                      className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">Image for social media sharing (1200x630px recommended)</p>
                  </div>
                </div>
              </div>

              {/* SEO Content Editor */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">SEO Content (Rich Text)</label>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
                  <RichTextEditor
                    value={form.seoContent}
                    onChange={(value) => setForm({ ...form, seoContent: value })}
                    placeholder="Enter rich HTML content for SEO. This content will be displayed on category pages and help with search engine rankings."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Rich HTML content for SEO. This content will be displayed on category pages and help with search engine rankings.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-8 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  disabled={createLoading || updateLoading}
                  className="px-8 py-4 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-white/50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || updateLoading}
                  className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none flex items-center space-x-3"
                >
                  {(createLoading || updateLoading) && (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>
                    {createLoading ? 'Creating...' : updateLoading ? 'Updating...' : (editingCategory ? 'Update Category' : 'Create Category')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modern Main Category Creation Modal */}
        {showMainCategoryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                    {editingMainCategory ? 'Edit Main Category' : 'Create Main Category'}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowMainCategoryModal(false)
                    setMainCategoryForm({ name: '', slug: '' })
                    setEditingMainCategory(null)
                  }}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-2xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleMainCategorySubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Main Category Name *</label>
                  <input
                    type="text"
                    value={mainCategoryForm.name}
                    onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, name: e.target.value })}
                    onBlur={() => generateMainCategorySlug(mainCategoryForm.name)}
                    className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                    placeholder="e.g., WINDOW SOLUTIONS"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Slug *</label>
                  <input
                    type="text"
                    value={mainCategoryForm.slug}
                    onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, slug: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                    placeholder="e.g., window-solutions"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">URL-friendly version of the main category name</p>
                </div>

                <div className="flex justify-end space-x-4 pt-8 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMainCategoryModal(false)
                      setMainCategoryForm({ name: '', slug: '' })
                      setEditingMainCategory(null)
                    }}
                    className="px-8 py-4 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-white/50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
                  >
                    {editingMainCategory ? 'Update Main Category' : 'Create Main Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Categories Management Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-white/20 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">
                    Main Categories
                  </h2>
                  <p className="text-gray-600 mt-1 text-lg">Manage your main categories</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                  <FolderOpen size={20} className="text-green-600" />
                  <span className="font-bold text-green-700">{mainCategories.length} main categories</span>
                </div>
                <button
                  onClick={() => {
                    setEditingMainCategory(null)
                    setMainCategoryForm({ name: '', slug: '' })
                    setShowMainCategoryModal(true)
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                >
                  <Plus size={20} />
                  Add Main Category
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {mainCategoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : mainCategories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No main categories found</h3>
                <p className="text-gray-600 mb-8 text-lg">Start by creating your first main category.</p>
                <button
                  onClick={() => {
                    setEditingMainCategory(null)
                    setMainCategoryForm({ name: '', slug: '' })
                    setShowMainCategoryModal(true)
                  }}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  <span>Create Main Category</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainCategories.map((mainCategory) => (
                  <div key={mainCategory._id} className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{mainCategory.name}</h3>
                        <p className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                          /{mainCategory.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditMainCategory(mainCategory)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          title="Edit main category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMainCategory(mainCategory._id)}
                          className={`p-2 rounded-xl transition-all duration-200 ${canDeleteMainCategory(mainCategory._id)
                              ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                              : 'text-gray-400 cursor-not-allowed'
                            }`}
                          title={
                            canDeleteMainCategory(mainCategory._id)
                              ? 'Delete main category'
                              : 'Cannot delete: has subcategories or products'
                          }
                          disabled={!canDeleteMainCategory(mainCategory._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>Order: {mainCategory.order || 0}</span>
                        {!canDeleteMainCategory(mainCategory._id) && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            Has subcategories
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${mainCategory.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {mainCategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Custom Field Form */}
        {showCustomFieldForm && selectedCategory && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Custom Field to {selectedCategory.name}
                </h2>
              </div>
              <button
                onClick={() => setShowCustomFieldForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCustomFieldSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Field Name *</label>
                  <input
                    type="text"
                    value={customFieldForm.name}
                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Field Slug *</label>
                  <input
                    type="text"
                    value={customFieldForm.slug}
                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, slug: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Field Type *</label>
                  <select
                    value={customFieldForm.type}
                    onChange={(e) => setCustomFieldForm({ ...customFieldForm, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="multi-select">Multi-select</option>
                    <option value="boolean">Boolean</option>
                    <option value="image">Image</option>
                    <option value="rich-text">Rich Text</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customFieldForm.required}
                      onChange={(e) => setCustomFieldForm({ ...customFieldForm, required: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required Field</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customFieldForm.visibleOnProduct}
                      onChange={(e) => setCustomFieldForm({ ...customFieldForm, visibleOnProduct: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Visible on Product Page</span>
                  </label>
                </div>
              </div>

              {/* Options for dropdown/multi-select */}
              {(customFieldForm.type === 'dropdown' || customFieldForm.type === 'multi-select') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {customFieldForm.options.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCustomFieldForm(false)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Variant Field Form */}
        {showVariantFieldForm && selectedCategory && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Variant Field to {selectedCategory.name}
                </h2>
              </div>
              <button
                onClick={() => setShowVariantFieldForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleVariantFieldSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Field Name *</label>
                  <input
                    type="text"
                    value={variantFieldForm.name}
                    onChange={(e) => setVariantFieldForm({ ...variantFieldForm, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Field Slug *</label>
                  <input
                    type="text"
                    value={variantFieldForm.slug}
                    onChange={(e) => setVariantFieldForm({ ...variantFieldForm, slug: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Field Type *</label>
                  <select
                    value={variantFieldForm.type}
                    onChange={(e) => setVariantFieldForm({ ...variantFieldForm, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                  >
                    <option value="dropdown">Dropdown</option>
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Unit (optional)</label>
                  <input
                    type="text"
                    value={variantFieldForm.unit}
                    onChange={(e) => setVariantFieldForm({ ...variantFieldForm, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    placeholder="e.g., ft, cm, kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Order</label>
                  <input
                    type="number"
                    value={variantFieldForm.order}
                    onChange={(e) => setVariantFieldForm({ ...variantFieldForm, order: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    min="1"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={variantFieldForm.required}
                      onChange={(e) => setVariantFieldForm({ ...variantFieldForm, required: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required Field</span>
                  </label>
                </div>
              </div>

              {/* Options for dropdown */}
              {variantFieldForm.type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {variantFieldForm.options.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVariantFieldForm(false)}
                  className="px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Add Variant Field
                </button>
              </div>
            </form>
          </div>
        )}



        {/* Modern Categories List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-48"></div>
                    </div>
                    <div className="w-24 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : allCategories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No categories found</h3>
              <p className="text-gray-600 mb-8 text-lg">Start by creating your first category.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={openFormAndScrollToTop}
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  <span>Create Category</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {allCategories.length > 0 ? allCategories.map((category) => (
                <div key={category._id} className="p-8 hover:bg-white/30 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-6 mb-6">
                        {category.image ? (
                          <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white/30 shadow-xl">
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-200 rounded-3xl flex items-center justify-center shadow-lg">
                            <FolderOpen className="w-10 h-10 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-3xl font-bold text-gray-900">{category.name}</h3>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full font-medium">/{category.slug}</span>
                            {category.mainCategoryId && (
                              <span className="text-sm text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full font-medium">
                                Main: {category.mainCategoryId.name || 'Unknown'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {category.description && (
                        <div
                          className="text-gray-600 mb-3 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: category.description }}
                        />
                      )}


                      {/* SEO Metadata Display */}
                      {(category.metaData?.title || category.metaData?.description || category.metaData?.keywords) && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-2">SEO Metadata</h4>
                          {category.metaData.title && (
                            <p className="text-xs text-blue-800 mb-1">
                              <strong>Title:</strong> {category.metaData.title}
                            </p>
                          )}
                          {category.metaData.description && (
                            <p className="text-xs text-blue-800 mb-1">
                              <strong>Description:</strong> {category.metaData.description}
                            </p>
                          )}
                          {category.metaData.keywords && (
                            <p className="text-xs text-blue-800">
                              <strong>Keywords:</strong> {Array.isArray(category.metaData.keywords) ? category.metaData.keywords.join(', ') : category.metaData.keywords}
                            </p>
                          )}
                        </div>
                      )}

                      {/* SEO Content Preview */}
                      {category.seoContent && (
                        <div className="mb-3 p-3 bg-green-50 rounded-lg">
                          <h4 className="text-sm font-medium text-green-900 mb-2">SEO Content</h4>
                          <div
                            className="text-xs text-green-800 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: category.seoContent.length > 200
                                ? category.seoContent.substring(0, 200) + '...'
                                : category.seoContent
                            }}
                          />
                        </div>
                      )}

                      {/* Custom Fields */}
                      {category.customFields && category.customFields.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Custom Fields ({category.customFields.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.customFields.map((field, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {field.name} ({field.type})
                                {field.required && <span className="text-red-600 ml-1">*</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Variant Fields */}
                      {category.variantFields && category.variantFields.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Variant Fields ({category.variantFields.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.variantFields.map((field, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {field.name} ({field.type})
                                {field.unit && <span className="text-purple-600 ml-1">({field.unit})</span>}
                                {field.required && <span className="text-red-600 ml-1">*</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-3 ml-8">
                      <button
                        onClick={() => handleEdit(category)}
                        className="inline-flex items-center space-x-2 px-6 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-2xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Edit3 className="w-5 h-5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => openCustomFieldFormAndScrollToTop(category)}
                        className="inline-flex items-center space-x-2 px-6 py-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Tag className="w-5 h-5" />
                        <span>Add Field</span>
                      </button>
                      <button
                        onClick={() => openVariantFieldFormAndScrollToTop(category)}
                        className="inline-flex items-center space-x-2 px-6 py-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-2xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Add Variant</span>
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="inline-flex items-center space-x-2 px-6 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No categories found. Create your first category!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


