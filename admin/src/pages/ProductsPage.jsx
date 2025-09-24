'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import apiClient from '../api/client';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    subcategoryId: '',
    name: '',
    slug: '',
    basePrice: '',
    mrp: '',
    discount: '',
    description: '',
    mainImages: [],
    imagePreviews: [], // For preview URLs
    hasVariants: false,
    variants: [],
    variantOptions: {}, // Store available options for each variant field
    dynamicFields: {},
    metaData: {
      title: '',
      description: '',
      keywords: '',
      ogImage: null
    }
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [variantForm, setVariantForm] = useState({
    fields: {},
    price: '',
    mrp: '',
    discount: '',
    stock: 0,
    images: []
  });

  const [variantOptionsForm, setVariantOptionsForm] = useState({
    fieldSlug: '',
    options: ['']
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/products');
      let data = response;
      if (response && response.data) {
        data = response.data;
      }
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data.items)) {
          setProducts(data.items);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to fetch products. Please check if the backend server is running.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch all subcategories using the main categories endpoint
      // The /api/categories endpoint returns subcategories (Category model)
      const response = await apiClient.get('/api/categories');
      let data = response;
      if (response && response.data) {
        data = response.data;
      }
      if (Array.isArray(data)) {
        setCategories(data);
        setSubcategories(data); // All categories from /api/categories are subcategories
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          setSubcategories(data.categories);
        } else if (Array.isArray(data.items)) {
          setCategories(data.items);
          setSubcategories(data.items);
        } else {
          setCategories([]);
          setSubcategories([]);
        }
      } else {
        setCategories([]);
        setSubcategories([]);
      }
    } catch (err) {
      setCategories([]);
      setSubcategories([]);
    }
  };

  // Removed fetchSubcategories - subcategories are now loaded directly from fetchCategories

  const fetchCategoryDetails = async (categoryId) => {
    try {
      const response = await apiClient.get(`/api/categories/id/${categoryId}`);
      let data = response;
      if (response && response.data) {
        data = response.data;
      }
      setSelectedCategory(data);
    } catch (err) {
      setSelectedCategory(null);
    }
  };

  // Removed handleMainCategoryChange - no longer needed

  const handleSubcategoryChange = (subcategoryId) => {
    setForm({ ...form, subcategoryId, dynamicFields: {} });
    if (subcategoryId) {
      fetchCategoryDetails(subcategoryId);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setForm({ ...form, categoryId, dynamicFields: {} });
    if (categoryId) {
      fetchCategoryDetails(categoryId);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Create preview URLs for all selected files
      const previews = files.map(file => URL.createObjectURL(file));
      setForm({
        ...form,
        mainImages: files,
        imagePreviews: previews
      });
    }
  };

  const removeImagePreview = (index) => {
    const newFiles = form.mainImages.filter((_, i) => i !== index);
    const newPreviews = form.imagePreviews.filter((_, i) => i !== index);
    setForm({
      ...form,
      mainImages: newFiles,
      imagePreviews: newPreviews
    });
  };

  const updateDynamicField = (fieldSlug, value) => {
    setForm(prev => ({
      ...prev,
      dynamicFields: {
        ...prev.dynamicFields,
        [fieldSlug]: value
      }
    }));
  };

  const updateVariantField = (fieldSlug, value) => {
    setVariantForm(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldSlug]: value
      }
    }));
  };

  const updateVariantOptions = (fieldSlug, options) => {
    setForm(prev => ({
      ...prev,
      variantOptions: {
        ...prev.variantOptions,
        [fieldSlug]: options
      }
    }));
  };

  const addVariantOption = () => {
    setVariantOptionsForm(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeVariantOption = (index) => {
    const newOptions = variantOptionsForm.options.filter((_, i) => i !== index);
    setVariantOptionsForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const updateVariantOption = (index, value) => {
    const newOptions = [...variantOptionsForm.options];
    newOptions[index] = value;
    setVariantOptionsForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const saveVariantOptions = () => {
    if (variantOptionsForm.fieldSlug && variantOptionsForm.options.length > 0) {
      const validOptions = variantOptionsForm.options.filter(option => option.trim() !== '');
      if (validOptions.length > 0) {
        updateVariantOptions(variantOptionsForm.fieldSlug, validOptions);
        setVariantOptionsForm({
          fieldSlug: '',
          options: ['']
        });
      }
    }
  };

  const resetForm = () => {
    setForm({
      subcategoryId: '',
      name: '',
      slug: '',
      basePrice: '',
      mrp: '',
      discount: '',
      description: '',
      mainImages: [],
      imagePreviews: [],
      hasVariants: false,
      variants: [],
      variantOptions: {},
      dynamicFields: {},
      metaData: {
        title: '',
        description: '',
        keywords: '',
        ogImage: null
      }
    });
    setEditingProduct(null);
    setSelectedCategory(null);
    setExistingImages([]);
  };

  const generateSlug = (name) => {
    if (name) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setForm({ ...form, slug });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (form.basePrice && parseFloat(form.basePrice) <= 0) {
      setError('Base price must be greater than 0');
      return;
    }

    if (form.mrp && parseFloat(form.mrp) < parseFloat(form.basePrice)) {
      setError('MRP cannot be less than base price');
      return;
    }

    if (form.discount && (parseFloat(form.discount) < 0 || parseFloat(form.discount) > 100)) {
      setError('Discount percentage must be between 0 and 100');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('categoryId', form.subcategoryId);
      formData.append('name', form.name);
      formData.append('slug', form.slug);
      formData.append('basePrice', form.basePrice);
      formData.append('mrp', form.mrp);
      formData.append('discount', form.discount);
      formData.append('description', form.description);

      formData.append('hasVariants', form.hasVariants);
      formData.append('variants', JSON.stringify(form.variants));
      formData.append('variantOptions', JSON.stringify(form.variantOptions));
      formData.append('dynamicFields', JSON.stringify(form.dynamicFields));

      // Append SEO metadata
      formData.append('metaData[title]', form.metaData.title || '');
      formData.append('metaData[description]', form.metaData.description || '');
      formData.append('metaData[keywords]', form.metaData.keywords || '');
      if (form.metaData.ogImage) {
        formData.append('metaData[ogImage]', form.metaData.ogImage);
      }

      // Handle images - only append if new images are selected
      if (form.mainImages && form.mainImages.length > 0) {
        // Check if these are actual File objects (new uploads) or existing image URLs
        const newImages = form.mainImages.filter(img => img instanceof File);
        if (newImages.length > 0) {
          for (let i = 0; i < newImages.length; i++) {
            formData.append('images', newImages[i]);
          }
        }
      }

      if (editingProduct) {
        setUpdateLoading(true);
        await apiClient.put(`/api/products/${editingProduct._id}`, formData);
        setError('');
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          setShowForm(false);
          resetForm();
        }, 2000);
        fetchProducts();
      } else {
        setCreateLoading(true);
        await apiClient.post('/api/products', formData);
        setError('');
        setSuccessMessage('Product created successfully!');
        setTimeout(() => {
          setSuccessMessage('');
          setShowForm(false);
          resetForm();
        }, 2000);
        fetchProducts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setCreateLoading(false);
      setUpdateLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      subcategoryId: product.categoryId || product.subcategoryId || '',
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice || product.price || '',
      mrp: product.mrp || '',
      discount: product.discount || '',
      description: product.description || '',
      mainImages: [], // Start with empty array for new uploads
      imagePreviews: [], // Start with empty array for new previews
      hasVariants: product.hasVariants || false,
      variants: product.variants || [],
      variantOptions: product.variantOptions || {},
      dynamicFields: product.dynamicFields || {},
      metaData: {
        title: product.metaData?.title || '',
        description: product.metaData?.description || '',
        keywords: Array.isArray(product.metaData?.keywords) ? product.metaData.keywords.join(', ') : (product.metaData?.keywords || ''),
        ogImage: product.metaData?.ogImage || null
      }
    });

    // Store existing images separately
    setExistingImages(product.mainImages || []);

    // Load subcategory details if subcategory is set
    if (product.categoryId || product.subcategoryId) {
      fetchCategoryDetails(product.categoryId || product.subcategoryId);
    }

    setShowForm(true);

    // Scroll to top when edit form opens
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.delete(`/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedProducts.length} product(s)? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        const deletePromises = selectedProducts.map(id => apiClient.delete(`/api/products/${id}`));
        await Promise.all(deletePromises);
        setSelectedProducts([]);
        setShowBulkActions(false);
        fetchProducts();
      } catch (err) {
        setError('Failed to delete some products');
      }
    }
  };

  const handleProductSelect = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  const addVariant = () => {
    const selectedCategory = categories.find(cat => cat._id === form.subcategoryId);
    if (!selectedCategory || !selectedCategory.variantFields) {
      alert('Please select a category with variant fields first');
      return;
    }

    const requiredFields = selectedCategory.variantFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !variantForm.fields[field.slug]);

    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }

    if (!variantForm.price) {
      alert('Please enter a price for the variant');
      return;
    }

    setForm({
      ...form,
      variants: [...form.variants, { ...variantForm }]
    });

    setVariantForm({
      fields: {},
      price: '',
      mrp: '',
      discount: '',
      stock: 0,
      images: []
    });
  };

  const removeVariant = (index) => {
    const newVariants = form.variants.filter((_, i) => i !== index);
    setForm({ ...form, variants: newVariants });
  };

  const renderDynamicField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={form.dynamicFields[field.slug] || ''}
            onChange={(e) => updateDynamicField(field.slug, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={form.dynamicFields[field.slug] || ''}
            onChange={(e) => updateDynamicField(field.slug, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        );
      case 'dropdown':
        return (
          <select
            value={form.dynamicFields[field.slug] || ''}
            onChange={(e) => updateDynamicField(field.slug, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">Select {field.name}</option>
            {field.options && field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'multi-select':
        return (
          <select
            multiple
            value={form.dynamicFields[field.slug] || []}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              updateDynamicField(field.slug, selectedOptions);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            {field.options && field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={form.dynamicFields[field.slug] || false}
            onChange={(e) => updateDynamicField(field.slug, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required={field.required}
          />
        );
      case 'image':
        return (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                updateDynamicField(field.slug, file);
              }
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        );
      case 'rich text':
        return (
          <textarea
            value={form.dynamicFields[field.slug] || ''}
            onChange={(e) => updateDynamicField(field.slug, e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        );
      default:
        return (
          <input
            type="text"
            value={form.dynamicFields[field.slug] || ''}
            onChange={(e) => updateDynamicField(field.slug, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${field.name}`}
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Product Management
              </h1>
              <p className="text-lg text-gray-600">Manage your product catalog with ease</p>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                // Scroll to top when form opens
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Plus size={20} />
              Add New Product
            </button>
          </div>
        </div>

        {/* Modern Success Alert */}
        {successMessage && (
          <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Error Alert */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 mb-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('backend server') && (
                  <div className="mt-3 text-xs text-red-700 space-y-1">
                    <p>• Make sure the backend server is running on port 5000</p>
                    <p>• Check the terminal for any error messages</p>
                    <p>• Try refreshing the page after starting the server</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modern Product Form */}
        {showForm && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden mb-6 relative">
            {/* Loading Overlay */}
            {(createLoading || updateLoading) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-3xl">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-700 font-medium">
                    {createLoading ? 'Creating product...' : 'Updating product...'}
                  </p>
                </div>
              </div>
            )}

            <div className="p-8 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <p className="text-gray-600 mt-1 text-lg">
                      {editingProduct ? 'Update your product information' : 'Create a new product for your catalog'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-2xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Category *
                      </label>
                      <select
                        value={form.subcategoryId}
                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        required
                      >
                        <option value="">Choose a category</option>
                        {subcategories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 font-medium">Select the category for your product</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onBlur={() => generateSlug(form.name)}
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        placeholder="Enter your product name"
                        required
                      />
                      <p className="text-xs text-gray-500 font-medium">This will be the main title of your product</p>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Product URL (Slug) *
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        placeholder="product-url-slug"
                        required
                      />
                      <p className="text-xs text-gray-500 font-medium">This creates the URL for your product page (auto-generated from name)</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-3xl p-8 border border-green-100/50 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">Pricing & Offers</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Selling Price *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">₹</span>
                        </div>
                        <input
                          type="number"
                          value={form.basePrice}
                          onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-2xl pl-10 pr-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                          placeholder="0"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">The price customers will pay</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        MRP (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">₹</span>
                        </div>
                        <input
                          type="number"
                          value={form.mrp}
                          onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-2xl pl-10 pr-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                          placeholder="0"
                        />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Original price before discount</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Discount % (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={form.discount}
                          onChange={(e) => setForm({ ...form, discount: e.target.value })}
                          className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm font-medium">%</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Percentage off MRP</p>
                    </div>
                  </div>

                  {/* Pricing Help */}
                  <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-green-100 rounded">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 text-sm">Pricing Tips</h4>
                        <div className="text-xs text-green-800 mt-1 space-y-1">
                          <p>• <strong>Simple products:</strong> Just set the selling price</p>
                          <p>• <strong>With offers:</strong> Set MRP and discount to show savings</p>
                          <p>• <strong>With variants:</strong> Set individual prices for each variant</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Images Section */}
                <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-3xl p-8 border border-purple-100/50 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Description & Images</h3>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Product Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={4}
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        placeholder="Describe your product in detail. What makes it special? What are its key features?"
                      />
                      <p className="text-xs text-gray-500 font-medium">Help customers understand what they're buying</p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Product Images {!editingProduct && '*'}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-purple-400 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70">
                        <input
                          key={editingProduct ? `edit-${editingProduct._id}` : 'new-product'}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          required={!editingProduct}
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center shadow-lg">
                              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {editingProduct ? 'Click to add new images' : 'Click to upload product images'}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                {editingProduct ?
                                  'Replace existing images (optional)' :
                                  'Upload multiple images for your product gallery'
                                }
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* New Image Previews */}
                      {form.imagePreviews && form.imagePreviews.length > 0 && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 shadow-lg">
                          <p className="text-sm font-bold text-blue-700 mb-4">New images to upload:</p>
                          <div className="flex flex-wrap gap-4">
                            {form.imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-24 h-24 object-cover rounded-2xl border-2 border-blue-200 shadow-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImagePreview(index)}
                                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-2xl transition-all duration-200 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    New
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {editingProduct && existingImages && existingImages.length > 0 && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 shadow-lg">
                          <p className="text-sm font-bold text-gray-700 mb-4">Current images:</p>
                          <div className="flex flex-wrap gap-4">
                            {existingImages.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt={`Current image ${index + 1}`}
                                  className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-2xl transition-all duration-200 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    Current
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Custom Fields based on Category */}
                {selectedCategory && selectedCategory.customFields && selectedCategory.customFields.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Category Fields ({selectedCategory.customFields.length} fields)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCategory.customFields.map((field) => (
                        <div key={field.slug}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {field.name}
                            {field.required && <span className="text-red-500">*</span>}
                            <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                          </label>
                          {renderDynamicField(field)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hasVariants"
                    checked={form.hasVariants}
                    onChange={(e) => setForm({ ...form, hasVariants: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasVariants" className="text-sm font-medium text-gray-700">
                    This product has variants
                  </label>
                </div>

                {/* Category Selection Warning */}
                {form.hasVariants && !selectedCategory && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please select a category first to configure variant fields.
                    </p>
                  </div>
                )}

                {/* Variant Fields Info */}
                {form.hasVariants && selectedCategory?.variantFields && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Variant Fields</h3>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 mb-2">
                        This category uses the following variant fields:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedCategory.variantFields.map((field, index) => (
                          <div key={index} className="text-sm text-blue-700">
                            <span className="font-medium">{field.name}</span>
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            {field.unit && <span className="text-blue-600 ml-1">({field.unit})</span>}
                            {field.type === 'dropdown' && field.options && (
                              <span className="text-blue-600 ml-1">Options: {field.options.join(', ')}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Variant Options Management */}
                    <div className="border-t pt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Define Available Options</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Set what values are available for each variant field in this product.
                      </p>

                      <div className="space-y-4">
                        {selectedCategory.variantFields.map((field) => (
                          <div key={field.slug} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-gray-900">
                                {field.name}
                                {field.unit && <span className="text-gray-500 ml-1">({field.unit})</span>}
                              </h5>
                              <span className="text-sm text-gray-500">
                                {form.variantOptions[field.slug]?.length || 0} options set
                              </span>
                            </div>

                            {/* Show current options */}
                            {form.variantOptions[field.slug] && form.variantOptions[field.slug].length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 mb-2">Current options:</p>
                                <div className="flex flex-wrap gap-2">
                                  {form.variantOptions[field.slug].map((option, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                      {option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add new options */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={variantOptionsForm.fieldSlug === field.slug ? variantOptionsForm.options[0] : ''}
                                  onChange={(e) => {
                                    if (variantOptionsForm.fieldSlug === field.slug) {
                                      updateVariantOption(0, e.target.value);
                                    } else {
                                      setVariantOptionsForm({
                                        fieldSlug: field.slug,
                                        options: [e.target.value]
                                      });
                                    }
                                  }}
                                  placeholder={`Enter ${field.name} option`}
                                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (variantOptionsForm.fieldSlug === field.slug) {
                                      addVariantOption();
                                    } else {
                                      setVariantOptionsForm({
                                        fieldSlug: field.slug,
                                        options: ['', '']
                                      });
                                    }
                                  }}
                                  className="px-3 py-2 text-blue-600 hover:text-blue-800 text-sm border border-blue-300 rounded-lg"
                                >
                                  + Add More
                                </button>
                              </div>

                              {/* Additional options */}
                              {variantOptionsForm.fieldSlug === field.slug && variantOptionsForm.options.length > 1 && (
                                <div className="space-y-2">
                                  {variantOptionsForm.options.slice(1).map((option, index) => (
                                    <div key={index + 1} className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateVariantOption(index + 1, e.target.value)}
                                        placeholder={`Option ${index + 2}`}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeVariantOption(index + 1)}
                                        className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Save button */}
                              {variantOptionsForm.fieldSlug === field.slug && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={saveVariantOptions}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Save Options
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bulk Variant Creation */}
                {form.hasVariants && selectedCategory?.variantFields && Object.keys(form.variantOptions).length > 0 && (
                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Bulk Variant Creation</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Create all possible variant combinations automatically with base pricing.
                    </p>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-2">Available combinations:</p>
                        {(() => {
                          if (!selectedCategory?.variantFields) return null;

                          const fields = selectedCategory.variantFields;
                          const options = form.variantOptions;
                          const combinations = fields.reduce((acc, field) => {
                            const fieldOptions = options[field.slug] || [];
                            return acc * Math.max(fieldOptions.length, 1);
                          }, 1);
                          return (
                            <p>
                              {fields.map((field, index) => {
                                const fieldOptions = options[field.slug] || [];
                                return (
                                  <span key={field.slug}>
                                    {field.name}: {fieldOptions.length} options
                                    {index < fields.length - 1 ? ' × ' : ''}
                                  </span>
                                );
                              })}
                              {combinations > 1 && (
                                <span className="font-bold ml-2">= {combinations} total variants</span>
                              )}
                            </p>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Price for All Variants</label>
                        <input
                          type="number"
                          value={variantForm.price}
                          onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                          placeholder="Base Price"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base MRP for All Variants</label>
                        <input
                          type="number"
                          value={variantForm.mrp}
                          onChange={(e) => setVariantForm({ ...variantForm, mrp: e.target.value })}
                          placeholder="Base MRP"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Base Stock for All Variants</label>
                        <input
                          type="number"
                          value={variantForm.stock}
                          onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                          placeholder="Base Stock"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedCategory?.variantFields) {
                          setError('Please select a category with variant fields first');
                          return;
                        }

                        const fields = selectedCategory.variantFields;
                        const options = form.variantOptions;

                        // Generate all combinations
                        const generateCombinations = (fieldIndex = 0, currentCombination = {}) => {
                          if (fieldIndex >= fields.length) {
                            return [currentCombination];
                          }

                          const field = fields[fieldIndex];
                          const fieldOptions = options[field.slug] || [];

                          if (fieldOptions.length === 0) {
                            return generateCombinations(fieldIndex + 1, currentCombination);
                          }

                          const combinations = [];
                          fieldOptions.forEach(option => {
                            const newCombination = { ...currentCombination, [field.slug]: option };
                            combinations.push(...generateCombinations(fieldIndex + 1, newCombination));
                          });

                          return combinations;
                        };

                        const allCombinations = generateCombinations();

                        // Create variants for each combination
                        const newVariants = allCombinations.map(combination => ({
                          fields: combination,
                          price: variantForm.price || form.basePrice,
                          mrp: variantForm.mrp || form.basePrice,
                          discount: variantForm.discount || 0,
                          stock: variantForm.stock || 0,
                          images: []
                        }));

                        setForm(prev => ({
                          ...prev,
                          variants: [...prev.variants, ...newVariants]
                        }));

                        // Reset variant form
                        setVariantForm({
                          fields: {},
                          price: '',
                          mrp: '',
                          discount: '',
                          stock: 0,
                          images: []
                        });
                      }}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Generate All Variants
                    </button>
                  </div>
                )}

                {/* Add Variant */}
                {form.hasVariants && (
                  <div className="border-t pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Add Variant</h4>

                    {/* Dynamic Variant Fields */}
                    {selectedCategory?.variantFields && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {selectedCategory.variantFields.map((field, index) => (
                          <div key={index}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.name}
                              {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {field.type === 'dropdown' && field.options ? (
                              <select
                                value={variantForm.fields[field.slug] || ''}
                                onChange={(e) => updateVariantField(field.slug, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required={field.required}
                              >
                                <option value="">Select {field.name}</option>
                                {field.options.map((option, optIndex) => (
                                  <option key={optIndex} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type === 'number' ? 'number' : 'text'}
                                value={variantForm.fields[field.slug] || ''}
                                onChange={(e) => updateVariantField(field.slug, e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={`Enter ${field.name}${field.unit ? ` (${field.unit})` : ''}`}
                                required={field.required}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}



                    {/* Basic Variant Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <input
                        type="number"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                        placeholder="Price"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={variantForm.mrp}
                        onChange={(e) => setVariantForm({ ...variantForm, mrp: e.target.value })}
                        placeholder="MRP"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={variantForm.stock}
                        onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                        placeholder="Stock"
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addVariant}
                      className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Variant
                    </button>
                  </div>
                )}

                {/* Individual Variant Pricing Management */}
                {form.hasVariants && form.variants && form.variants.length > 0 && selectedCategory?.variantFields && (
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Variant Pricing Management</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Set individual prices, MRP, and stock for each variant combination. Each variant can have its own pricing.
                    </p>

                    <div className="space-y-4">
                      {form.variants.map((variant, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Variant Details */}
                            <div className="col-span-1 md:col-span-2">
                              <h6 className="font-medium text-gray-900 mb-2">Variant {index + 1}</h6>
                              <div className="space-y-1">
                                {variant.fields && Object.entries(variant.fields).map(([fieldSlug, value]) => {
                                  const field = selectedCategory?.variantFields?.find(f => f.slug === fieldSlug);
                                  return (
                                    <div key={fieldSlug} className="text-sm">
                                      <span className="text-gray-600">{field?.name || fieldSlug}:</span>
                                      <span className="ml-2 font-medium">{value}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Price Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                              <input
                                type="number"
                                value={variant.price || ''}
                                onChange={(e) => {
                                  const newVariants = [...form.variants];
                                  newVariants[index].price = e.target.value;
                                  setForm({ ...form, variants: newVariants });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Price"
                              />
                            </div>

                            {/* MRP Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                              <input
                                type="number"
                                value={variant.mrp || ''}
                                onChange={(e) => {
                                  const newVariants = [...form.variants];
                                  newVariants[index].mrp = e.target.value;
                                  setForm({ ...form, variants: newVariants });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="MRP"
                              />
                            </div>

                            {/* Stock Input */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                              <input
                                type="number"
                                value={variant.stock || ''}
                                onChange={(e) => {
                                  const newVariants = [...form.variants];
                                  newVariants[index].stock = e.target.value;
                                  setForm({ ...form, variants: newVariants });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Stock"
                              />
                            </div>
                          </div>

                          {/* Calculated Discount */}
                          {variant.mrp && variant.price && parseFloat(variant.mrp) > parseFloat(variant.price) && (
                            <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                              <span className="text-sm text-green-800">
                                Auto-calculated discount: {(((parseFloat(variant.mrp) - parseFloat(variant.price)) / parseFloat(variant.mrp)) * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}

                          {/* Remove Variant Button */}
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const newVariants = form.variants.filter((_, i) => i !== index);
                                setForm({ ...form, variants: newVariants });
                              }}
                              className="px-3 py-1 text-red-600 hover:text-red-800 text-sm border border-red-300 rounded hover:bg-red-50"
                            >
                              Remove Variant
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variants List */}
                {form.hasVariants && form.variants.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Current Variants</h4>
                    <div className="space-y-2">
                      {form.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1">
                            {/* Display dynamic variant fields */}
                            {variant.fields && Object.entries(variant.fields).map(([, value], fieldIndex) => (
                              <span key={fieldIndex}>
                                {fieldIndex > 0 && <span className="mx-1">-</span>}
                                <span className="font-medium">{value}</span>
                              </span>
                            ))}
                            <span className="ml-4 text-gray-600">₹{variant.price}</span>
                            {variant.stock > 0 && <span className="ml-2 text-green-600">Stock: {variant.stock}</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO Metadata - Collapsible */}
                <div className="border-t pt-6">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Search Engine Optimization (SEO)</h3>
                          <p className="text-sm text-gray-600">Help customers find your product online</p>
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded-lg shadow-sm group-open:rotate-180 transition-transform duration-200">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </summary>

                    <div className="mt-6 p-6 bg-gray-50/50 rounded-xl border border-gray-200">
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 text-sm">Why SEO matters</h4>
                            <p className="text-xs text-blue-800 mt-1">
                              Good SEO helps your products appear in Google search results, bringing more customers to your store.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Search Title *
                          </label>
                          <input
                            type="text"
                            value={form.metaData.title}
                            onChange={(e) => setForm({
                              ...form,
                              metaData: { ...form.metaData, title: e.target.value }
                            })}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                            placeholder="e.g., Premium Wooden Dining Table - Modern Design"
                            maxLength={60}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>How your product appears in Google</span>
                            <span className={form.metaData.title.length > 60 ? 'text-red-500' : 'text-green-500'}>
                              {form.metaData.title.length}/60
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Search Description *
                          </label>
                          <textarea
                            value={form.metaData.description}
                            onChange={(e) => setForm({
                              ...form,
                              metaData: { ...form.metaData, description: e.target.value }
                            })}
                            rows={3}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                            placeholder="Brief description that appears under your product in search results"
                            maxLength={160}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Description shown in search results</span>
                            <span className={form.metaData.description.length > 160 ? 'text-red-500' : 'text-green-500'}>
                              {form.metaData.description.length}/160
                            </span>
                          </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Keywords (Optional)
                          </label>
                          <input
                            type="text"
                            value={form.metaData.keywords}
                            onChange={(e) => setForm({
                              ...form,
                              metaData: { ...form.metaData, keywords: e.target.value }
                            })}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white"
                            placeholder="wooden table, dining furniture, modern design, home decor"
                          />
                          <p className="text-xs text-gray-500">
                            Separate keywords with commas. These help Google understand what your product is about.
                          </p>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-6 pt-8 border-t border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-8 py-4 border-2 border-gray-200 rounded-2xl text-gray-700 hover:bg-white/50 hover:border-gray-300 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || updateLoading}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none flex items-center gap-3"
                  >
                    {createLoading || updateLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modern Products Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-8 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Your Products
                  </h3>
                  <p className="text-gray-600 mt-1 text-lg">
                    {Array.isArray(products) ? products.length : 0} products in your catalog
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-bold text-sm">
                    {products.filter(p => p.hasVariants).length} with variants
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl shadow-lg">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-bold text-sm">
                    {products.filter(p => p.metaData?.title).length} optimized
                  </span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-6 text-gray-600 font-semibold text-lg">Loading your products...</p>
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Package className="w-14 h-14 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">No products yet</h3>
              <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg">
                Start building your product catalog by adding your first product. It's easy and takes just a few minutes!
              </p>
              <button
                onClick={() => {
                  setShowForm(true);
                  // Scroll to top when form opens
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <Plus size={24} />
                Create Your First Product
              </button>
            </div>
          ) : (
            <>
              {/* Bulk Actions Bar */}
              {selectedProducts.length > 0 && (
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {selectedProducts.length}
                          </span>
                        </div>
                        <span className="text-blue-900 font-medium">
                          {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedProducts([]);
                          setShowBulkActions(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Clear Selection
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        Delete Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modern Products Grid */}
              <div className="p-8">
                {/* Select All Header */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-100/50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span className="text-lg font-bold text-gray-900">
                      Select All Products ({products.length} total)
                    </span>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product._id} className="group bg-white/50 backdrop-blur-sm rounded-3xl border border-white/30 p-6 hover:bg-white/70 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Product Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            checked={selectedProducts.includes(product._id)}
                            onChange={(e) => handleProductSelect(product._id, e.target.checked)}
                          />
                          <div className="flex-shrink-0 h-16 w-16 rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
                            {product.mainImages && product.mainImages.length > 0 ? (
                              <img
                                className="h-16 w-16 object-cover"
                                src={product.mainImages[0]}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-16 w-16 flex items-center justify-center">
                                <ImageIcon size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {product.hasVariants && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                              <Package size={12} />
                              {product.variants?.length || 0} variants
                            </div>
                          )}
                          {product.metaData?.title && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              SEO Ready
                            </div>
                          )}
                          {!product.hasVariants && !product.metaData?.title && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                              Basic
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="font-medium">SKU:</span>
                          <span>{product.slug}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Category:</span>
                          <span>{categories.find(c => c._id === (product.categoryId || product.subcategoryId))?.name || 'Uncategorized'}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{product.basePrice || product.price || 0}
                            </div>
                            {product.mrp && product.mrp > (product.basePrice || product.price) && (
                              <div className="text-sm text-gray-500 line-through">
                                MRP: ₹{product.mrp}
                              </div>
                            )}
                          </div>
                          {product.discount && product.discount > 0 && (
                            <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="mb-4 text-sm text-gray-500">
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
