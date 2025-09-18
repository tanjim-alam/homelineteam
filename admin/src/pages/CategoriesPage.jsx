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

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: null,
    imagePreview: null,
    seoContent: '',
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
    dispatch(listCategories())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, dispatch])

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData()

    // Append basic fields
    formData.append('name', form.name)
    formData.append('slug', form.slug)
    formData.append('description', form.description)
    formData.append('seoContent', form.seoContent)

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
      dispatch(createCategory(formData))
        .then(() => {
          setSuccessMessage('Category created successfully!')
          setTimeout(() => {
            setSuccessMessage('')
            resetForm()
            setShowForm(false)
          }, 2000)
        })
        .catch(() => {
          // Error handling is done by Redux
        })
    }
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
      metaData: {
        title: category.metaData?.title || '',
        description: category.metaData?.description || '',
        keywords: Array.isArray(category.metaData?.keywords) ? category.metaData.keywords.join(', ') : (category.metaData?.keywords || ''),
        ogImage: category.metaData?.ogImage || ''
      }
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id))
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

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-lg text-gray-600 mt-2">Manage your product categories and organize your inventory</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative">
          {/* Loading Overlay */}
          {(createLoading || updateLoading) && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-700 font-medium">
                  {createLoading ? 'Creating category...' : 'Updating category...'}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>
            <button
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onBlur={() => generateSlug(form.name)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">URL-friendly version of the category name</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Description (Rich Text)</label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(value) => setForm({ ...form, description: value })}
                    placeholder="Enter a detailed description of the category with rich formatting"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use the rich text editor to format your category description with headings, lists, links, and more.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category Image</label>

                  {/* Image Preview */}
                  {form.imagePreview && (
                    <div className="mb-4">
                      <div className="relative inline-block">
                        <img
                          src={form.imagePreview}
                          alt="Category preview"
                          className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: null, imagePreview: null })}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click the X to remove this image</p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">Upload a category image (JPG, PNG, GIF - Max 5MB)</p>
                </div>
              </div>

              {/* SEO Metadata */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Title</label>
                  <input
                    type="text"
                    value={form.metaData.title}
                    onChange={(e) => setForm({
                      ...form,
                      metaData: { ...form.metaData, title: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    placeholder="SEO title for search engines"
                  />
                  <p className="text-xs text-gray-500 mt-2">Recommended: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Description</label>
                  <textarea
                    value={form.metaData.description}
                    onChange={(e) => setForm({
                      ...form,
                      metaData: { ...form.metaData, description: e.target.value }
                    })}
                    rows={3}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    placeholder="SEO description for search engines"
                  />
                  <p className="text-xs text-gray-500 mt-2">Recommended: 150-160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Meta Keywords</label>
                  <input
                    type="text"
                    value={form.metaData.keywords}
                    onChange={(e) => setForm({
                      ...form,
                      metaData: { ...form.metaData, keywords: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                    placeholder="Keywords separated by commas"
                  />
                  <p className="text-xs text-gray-500 mt-2">Comma-separated keywords for SEO</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Open Graph Image</label>
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
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">Image for social media sharing (1200x630px recommended)</p>
                </div>
              </div>
            </div>

            {/* SEO Content Editor */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">SEO Content (Rich Text)</label>
              <RichTextEditor
                value={form.seoContent}
                onChange={(value) => setForm({ ...form, seoContent: value })}
                placeholder="Enter rich HTML content for SEO. This content will be displayed on category pages and help with search engine rankings."
              />
              <p className="text-xs text-gray-500 mt-2">
                Rich HTML content for SEO. This content will be displayed on category pages and help with search engine rankings.
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                disabled={createLoading || updateLoading}
                className="px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading || updateLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center space-x-2"
              >
                {(createLoading || updateLoading) && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>
                  {createLoading ? 'Creating...' : updateLoading ? 'Updating...' : (editingCategory ? 'Update Category' : 'Create Category')}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first product category.</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span>Create Category</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((category) => (
              <div key={category._id} className="p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      {category.image ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                          <FolderOpen className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">/{category.slug}</span>
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

                  <div className="flex flex-col space-y-3 ml-6">
                    <button
                      onClick={() => handleEdit(category)}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category)
                        setShowCustomFieldForm(true)
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Add Field</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCategory(category)
                        setShowVariantFieldForm(true)
                      }}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Add Variant</span>
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="inline-flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


