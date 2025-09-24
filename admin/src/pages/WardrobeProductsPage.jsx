'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Layers } from 'lucide-react';
import apiClient from '../api/client';

export default function WardrobeProductsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    basePrice: '',
    mrp: '',
    discount: '',
    mainImages: [],
    category: 'wardrobe',
    defaultOpening: 'sliding',
    defaultType: '3-door',
    defaultMaterials: [],
    defaultFeatures: [],
    availableTypes: ['2-door', '3-door', '4-door', '5-door', 'sliding'],
    hasVariants: false,
    variants: [],
    variantOptions: {},
    dynamicFields: {},
    wardrobeMetadata: {
      suitableFor: [],
      style: [],
      colorScheme: [],
      deliveryTime: ''
    },
    metaData: { title: '', description: '', keywords: '', ogImage: null },
    tags: ''
  });

  const featureOptions = [
    { id: 'led', name: 'LED Lighting', category: 'lighting' },
    { id: 'soft-close', name: 'Soft Close Hinges', category: 'hardware' },
    { id: 'drawer-organizer', name: 'Drawer Organizer', category: 'organization' },
    { id: 'locker', name: 'Locker', category: 'safety' }
  ];

  const materialOptions = [
    { category: 'carcass', material: 'PLY' },
    { category: 'carcass', material: 'MDF' },
    { category: 'shutter', material: 'Laminate' },
    { category: 'shutter', material: 'Acrylic' },
    { category: 'finish', material: 'Matte' },
    { category: 'finish', material: 'Glossy' }
  ];

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/wardrobe-products');
      const data = res?.data || res;
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load wardrobes');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setForm({ ...form, slug });
  };

  const resetForm = () => {
    setForm({
      name: '', slug: '', description: '', basePrice: '', mrp: '', discount: '', mainImages: [],
      category: 'wardrobe', defaultOpening: 'sliding', defaultType: '3-door', defaultMaterials: [], defaultFeatures: [],
      availableTypes: ['2-door', '3-door', '4-door', '5-door', 'sliding'], hasVariants: false, variants: [],
      variantOptions: {}, dynamicFields: {}, wardrobeMetadata: { suitableFor: [], style: [], colorScheme: [], deliveryTime: '' },
      metaData: { title: '', description: '', keywords: '', ogImage: null }, tags: ''
    });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('slug', form.slug);
      fd.append('description', form.description);
      fd.append('basePrice', form.basePrice);
      fd.append('mrp', form.mrp);
      fd.append('discount', form.discount);
      fd.append('category', form.category);
      fd.append('defaultOpening', form.defaultOpening);
      fd.append('defaultType', form.defaultType);
      fd.append('defaultMaterials', JSON.stringify(form.defaultMaterials));
      fd.append('defaultFeatures', JSON.stringify(form.defaultFeatures));
      fd.append('availableTypes', JSON.stringify(form.availableTypes));
      fd.append('hasVariants', form.hasVariants);
      fd.append('variants', JSON.stringify(form.variants));
      fd.append('variantOptions', JSON.stringify(form.variantOptions));
      fd.append('dynamicFields', JSON.stringify(form.dynamicFields));
      fd.append('wardrobeMetadata', JSON.stringify(form.wardrobeMetadata));
      fd.append('metaData[title]', form.metaData.title || '');
      fd.append('metaData[description]', form.metaData.description || '');
      fd.append('metaData[keywords]', form.metaData.keywords || '');
      fd.append('tags', form.tags);
      if (form.mainImages?.length) {
        const files = form.mainImages.filter(f => f instanceof File);
        files.forEach(f => fd.append('images', f));
      }

      if (editing) {
        await apiClient.put(`/api/wardrobe-products/${editing._id}`, fd);
      } else {
        await apiClient.post('/api/wardrobe-products', fd);
      }
      setShowForm(false);
      resetForm();
      fetchItems();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save wardrobe');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      basePrice: item.basePrice || '',
      mrp: item.mrp || '',
      discount: item.discount || '',
      mainImages: [],
      category: item.category || 'wardrobe',
      defaultOpening: item.defaultOpening || 'sliding',
      defaultType: item.defaultType || '3-door',
      defaultMaterials: item.defaultMaterials || [],
      defaultFeatures: item.defaultFeatures || [],
      availableTypes: item.availableTypes || ['2-door', '3-door', '4-door', '5-door', 'sliding'],
      hasVariants: item.hasVariants || false,
      variants: item.variants || [],
      variantOptions: item.variantOptions || {},
      dynamicFields: item.dynamicFields || {},
      wardrobeMetadata: item.wardrobeMetadata || { suitableFor: [], style: [], colorScheme: [], deliveryTime: '' },
      metaData: {
        title: item.metaData?.title || '',
        description: item.metaData?.description || '',
        keywords: Array.isArray(item.metaData?.keywords) ? item.metaData.keywords.join(', ') : (item.metaData?.keywords || ''),
        ogImage: item.metaData?.ogImage || null
      },
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wardrobe product?')) return;
    try { await apiClient.delete(`/api/wardrobe-products/${id}`); fetchItems(); }
    catch (e) { setError('Failed to delete wardrobe'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent mb-2">
                Wardrobe Products
              </h1>
              <p className="text-lg text-gray-600">Manage your dynamic wardrobe catalog with ease</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <Plus size={20} />
              Add Wardrobe Product
            </button>
          </div>
        </div>

        {/* Modern Error Alert */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-white/20 bg-gradient-to-r from-violet-50/50 to-purple-50/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                      {editing ? 'Edit Wardrobe Product' : 'Add New Wardrobe Product'}
                    </h2>
                    <p className="text-gray-600 mt-1 text-lg">
                      {editing ? 'Update your wardrobe product information' : 'Create a new wardrobe product for your catalog'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-2xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-3xl p-8 border border-violet-100/50 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Product Name *</label>
                    <input
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      onBlur={() => generateSlug(form.name)}
                      placeholder="Enter wardrobe product name"
                      required
                    />
                    <p className="text-xs text-gray-500 font-medium">This will be the main title of your wardrobe product</p>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Product URL (Slug) *</label>
                    <input
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="wardrobe-product-url-slug"
                      required
                    />
                    <p className="text-xs text-gray-500 font-medium">This creates the URL for your product page (auto-generated from name)</p>
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Product Description</label>
                  <textarea
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe your wardrobe product in detail. What makes it special? What are its key features?"
                  />
                  <p className="text-xs text-gray-500 font-medium mt-2">Help customers understand what they're buying</p>
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
                    <label className="block text-sm font-bold text-gray-700">Selling Price *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">₹</span>
                      </div>
                      <input
                        type="number"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-10 pr-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        value={form.basePrice}
                        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">The price customers will pay</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">MRP (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">₹</span>
                      </div>
                      <input
                        type="number"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-10 pr-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        value={form.mrp}
                        onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">Original price before discount</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">Discount % (Optional)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                        value={form.discount}
                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
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
              </div>

              {/* Wardrobe Configuration Section */}
              <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-3xl p-8 border border-amber-100/50 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">Wardrobe Configuration</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">Opening Type</label>
                    <div className="flex flex-wrap gap-3">
                      {['sliding', 'swinging'].map(t => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setForm({ ...form, defaultOpening: t })}
                          className={`px-6 py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${form.defaultOpening === t
                              ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-violet-200'
                              : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-violet-300 hover:bg-violet-50/50 text-gray-700'
                            }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-3">Choose how the wardrobe doors open</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">Default Wardrobe Type</label>
                    <div className="flex flex-wrap gap-3">
                      {['2-door', '3-door', '4-door', '5-door', 'sliding'].map(t => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setForm({ ...form, defaultType: t })}
                          className={`px-6 py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${form.defaultType === t
                              ? 'border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-200'
                              : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-amber-300 hover:bg-amber-50/50 text-gray-700'
                            }`}
                        >
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-3">Select the default number of doors or sliding type</p>
                  </div>
                </div>
              </div>

              {/* Features & Materials Section */}
              <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Features & Materials</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">Default Features</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {featureOptions.map(f => {
                        const selected = form.defaultFeatures.some(x => x.id === f.id);
                        return (
                          <label key={f.id} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/70 transition-all duration-200 bg-white/50 backdrop-blur-sm border cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {
                                const exists = form.defaultFeatures.some(x => x.id === f.id);
                                setForm({ ...form, defaultFeatures: exists ? form.defaultFeatures.filter(x => x.id !== f.id) : [...form.defaultFeatures, f] });
                              }}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm font-medium text-gray-700">{f.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-3">Select the features included with this wardrobe</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">Default Materials</label>
                    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materialOptions.map((m, i) => {
                          const key = `${m.category}-${m.material}-${i}`;
                          const selected = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                          return (
                            <label key={key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 transition-all duration-200 bg-white/30 backdrop-blur-sm border cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => {
                                  const exists = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                                  setForm({ ...form, defaultMaterials: exists ? form.defaultMaterials.filter(x => !(x.category === m.category && x.material === m.material)) : [...form.defaultMaterials, m] });
                                }}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-gray-700">{m.category} • {m.material}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-3">Choose the materials used in this wardrobe</p>
                  </div>
                </div>
              </div>

              {/* Product Images Section */}
              <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-3xl p-8 border border-purple-100/50 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Product Images</h3>
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-700 mb-2">Upload Product Images</h4>
                      <p className="text-gray-500 mb-4">Choose multiple images to showcase your wardrobe product</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setForm({ ...form, mainImages: files });
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose Images
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium text-center">Upload high-quality images to attract customers</p>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-8 py-4 border-2 border-gray-300 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {editing ? 'Update Wardrobe' : 'Create Wardrobe'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modern Products Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-violet-50/50 to-purple-50/50 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <Layers className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                    Wardrobe Products
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {items.length} {items.length === 1 ? 'product' : 'products'} in your catalog
                  </p>
                </div>
              </div>
              {items.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 rounded-full text-sm font-bold border border-violet-200">
                    {items.length} items
                  </div>
                </div>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-violet-100 to-purple-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                <Layers className="w-14 h-14 text-violet-600" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent mb-4">No wardrobe products yet</h3>
              <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg">
                Start building your wardrobe catalog by adding your first wardrobe product. It's easy and takes just a few minutes!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                <Plus size={24} />
                Create Your First Wardrobe Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price & Offers
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Variants
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                            {item.mainImages?.[0] ? (
                              <img src={item.mainImages[0]} alt={item.name} className="h-12 w-12 object-cover" />
                            ) : (
                              <div className="h-12 w-12 flex items-center justify-center">
                                <Layers size={20} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.defaultType || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{item.basePrice || 0}
                          </div>
                          {item.mrp && item.mrp > item.basePrice && (
                            <div className="text-xs text-gray-500 line-through">
                              MRP: ₹{item.mrp}
                            </div>
                          )}
                          {item.discount && item.discount > 0 && (
                            <div className="text-xs text-green-600 font-medium">
                              {item.discount}% OFF
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {item.hasVariants && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 text-xs font-medium rounded-full w-fit">
                              <Package size={12} />
                              {item.variants?.length || 0} variants
                            </div>
                          )}
                          {!item.hasVariants && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 text-xs font-medium rounded-full w-fit">
                              No variants
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg hover:from-red-100 hover:to-red-200 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


