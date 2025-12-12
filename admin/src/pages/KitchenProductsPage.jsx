'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, ChefHat } from 'lucide-react';
import apiClient from '../api/client';

export default function KitchenProductsPage() {
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
        imagePreviews: [], // For preview URLs
        category: 'modular-kitchen',
        defaultLayout: null,
        defaultMaterials: [],
        defaultAppliances: [],
        defaultFeatures: [],
        availableLayouts: [],
        availableMaterials: [],
        availableAppliances: [],
        availableFeatures: [],
        hasVariants: false,
        variants: [],
        variantOptions: {},
        dynamicFields: {},
        kitchenMetadata: {
            suitableFor: [],
            style: [],
            colorScheme: [],
            deliveryTime: '',
            warranty: '',
            budget: { min: '', max: '' },
            installation: { included: false, cost: '' }
        },
        metaData: { title: '', description: '', keywords: '', ogImage: null },
        tags: ''
    });

    const layoutOptions = [
        { type: 'straight', name: 'Straight Layout', description: 'Single wall kitchen design' },
        { type: 'l-shape', name: 'L-Shape Layout', description: 'Corner kitchen design' },
        { type: 'parallel', name: 'Parallel Layout', description: 'Two-wall parallel design' },
    ];

    const materialOptions = [
        { category: 'cabinets', material: 'Plywood', quality: 'good' },
        { category: 'cabinets', material: 'MDF', quality: 'basic' },
        { category: 'cabinets', material: 'Particle Board', quality: 'basic' },
        { category: 'countertop', material: 'Granite', quality: 'premium' },
        { category: 'countertop', material: 'Quartz', quality: 'best' },
        { category: 'countertop', material: 'Marble', quality: 'premium' },
        { category: 'countertop', material: 'Laminate', quality: 'good' },
        { category: 'backsplash', material: 'Tiles', quality: 'good' },
        { category: 'backsplash', material: 'Glass', quality: 'better' },
        { category: 'flooring', material: 'Ceramic Tiles', quality: 'good' },
        { category: 'flooring', material: 'Vitrified Tiles', quality: 'better' },
        { category: 'hardware', material: 'Soft Close Hinges', quality: 'better' },
        { category: 'hardware', material: 'Standard Hinges', quality: 'basic' }
    ];

    const applianceOptions = [
        { id: 'hob', name: 'Gas Hob', category: 'cooking', essential: true },
        { id: 'chimney', name: 'Chimney', category: 'ventilation', essential: true },
        { id: 'sink', name: 'Kitchen Sink', category: 'utility', essential: true },
        { id: 'faucet', name: 'Faucet', category: 'utility', essential: true },
        { id: 'refrigerator', name: 'Refrigerator', category: 'storage', essential: false },
        { id: 'microwave', name: 'Microwave', category: 'cooking', essential: false },
        { id: 'dishwasher', name: 'Dishwasher', category: 'cleaning', essential: false }
    ];

    const featureOptions = [
        { id: 'led-lighting', name: 'LED Lighting', category: 'lighting' },
        { id: 'soft-close', name: 'Soft Close Drawers', category: 'hardware' },
        { id: 'pull-out', name: 'Pull-out Storage', category: 'storage' },
        { id: 'corner-solution', name: 'Corner Solutions', category: 'storage' },
        { id: 'tall-unit', name: 'Tall Storage Unit', category: 'storage' },
        { id: 'breakfast-counter', name: 'Breakfast Counter', category: 'convenience' }
    ];

    const styleOptions = ['modern', 'traditional', 'contemporary', 'minimalist', 'industrial', 'scandinavian'];
    const colorSchemeOptions = ['white', 'wood', 'grey', 'colorful', 'black', 'neutral'];
    const suitableForOptions = ['1bhk', '2bhk', '3bhk', '4bhk', 'villa', 'studio'];

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/kitchen-products');
            const data = res?.data || res;
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setError('Failed to load kitchen products');
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

    const resetForm = () => {
        setForm({
            name: '', slug: '', description: '', basePrice: '', mrp: '', discount: '', mainImages: [], imagePreviews: [],
            category: 'modular-kitchen', defaultLayout: null, defaultMaterials: [], defaultAppliances: [], defaultFeatures: [],
            availableLayouts: [], availableMaterials: [], availableAppliances: [], availableFeatures: [],
            hasVariants: false, variants: [], variantOptions: {}, dynamicFields: {},
            kitchenMetadata: {
                suitableFor: [], style: [], colorScheme: [], deliveryTime: '', warranty: '',
                budget: { min: '', max: '' }, installation: { included: false, cost: '' }
            },
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
            fd.append('defaultLayout', JSON.stringify(form.defaultLayout));
            fd.append('defaultMaterials', JSON.stringify(form.defaultMaterials));
            fd.append('defaultAppliances', JSON.stringify(form.defaultAppliances));
            fd.append('defaultFeatures', JSON.stringify(form.defaultFeatures));
            fd.append('availableLayouts', JSON.stringify(form.availableLayouts));
            fd.append('availableMaterials', JSON.stringify(form.availableMaterials));
            fd.append('availableAppliances', JSON.stringify(form.availableAppliances));
            fd.append('availableFeatures', JSON.stringify(form.availableFeatures));
            fd.append('hasVariants', form.hasVariants);
            fd.append('variants', JSON.stringify(form.variants));
            fd.append('variantOptions', JSON.stringify(form.variantOptions));
            fd.append('dynamicFields', JSON.stringify(form.dynamicFields));
            fd.append('kitchenMetadata', JSON.stringify(form.kitchenMetadata));
            fd.append('metaData[title]', form.metaData.title || '');
            fd.append('metaData[description]', form.metaData.description || '');
            fd.append('metaData[keywords]', form.metaData.keywords || '');
            fd.append('tags', form.tags);
            if (form.mainImages?.length) {
                const files = form.mainImages.filter(f => f instanceof File);
                files.forEach(f => fd.append('images', f));
            }

            if (editing) {
                await apiClient.put(`/kitchen-products/${editing._id}`, fd);
            } else {
                await apiClient.post('/kitchen-products', fd);
            }
            setShowForm(false);
            resetForm();
            fetchItems();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to save kitchen product');
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
            mainImages: [], // Start with empty array for new uploads
            imagePreviews: [], // Start with empty array for new previews
            category: item.category || 'modular-kitchen',
            defaultLayout: item.defaultLayout || null,
            defaultMaterials: item.defaultMaterials || [],
            defaultAppliances: item.defaultAppliances || [],
            defaultFeatures: item.defaultFeatures || [],
            availableLayouts: item.availableLayouts || [],
            availableMaterials: item.availableMaterials || [],
            availableAppliances: item.availableAppliances || [],
            availableFeatures: item.availableFeatures || [],
            hasVariants: item.hasVariants || false,
            variants: item.variants || [],
            variantOptions: item.variantOptions || {},
            dynamicFields: item.dynamicFields || {},
            kitchenMetadata: item.kitchenMetadata || {
                suitableFor: [], style: [], colorScheme: [], deliveryTime: '', warranty: '',
                budget: { min: '', max: '' }, installation: { included: false, cost: '' }
            },
            metaData: {
                title: item.metaData?.title || '',
                description: item.metaData?.description || '',
                keywords: Array.isArray(item.metaData?.keywords) ? item.metaData.keywords.join(', ') : (item.metaData?.keywords || ''),
                ogImage: item.metaData?.ogImage || null
            },
            tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
        });
        setShowForm(true);

        // Scroll to top when edit form opens
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this kitchen product?')) return;
        try {
            await apiClient.delete(`/kitchen-products/${id}`);
            fetchItems();
        } catch (e) {
            setError('Failed to delete kitchen product');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Modern Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent mb-2">
                                Kitchen Products
                            </h1>
                            <p className="text-lg text-gray-600">Manage your dynamic kitchen catalog with ease</p>
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
                            className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                        >
                            <Plus size={20} />
                            Add Kitchen Product
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
                        <div className="p-8 border-b border-white/20 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center">
                                        <ChefHat className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">
                                            {editing ? 'Edit Kitchen Product' : 'Add New Kitchen Product'}
                                        </h2>
                                        <p className="text-gray-600 mt-1 text-lg">
                                            {editing ? 'Update your kitchen product information' : 'Create a new kitchen product for your catalog'}
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
                            <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-3xl p-8 border border-orange-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">Basic Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Product Name *</label>
                                        <input
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            onBlur={() => generateSlug(form.name)}
                                            placeholder="Enter kitchen product name"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 font-medium">This will be the main title of your kitchen product</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Product URL (Slug) *</label>
                                        <input
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            placeholder="kitchen-product-url-slug"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 font-medium">This creates the URL for your product page (auto-generated from name)</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Product Description</label>
                                    <textarea
                                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Describe your kitchen product in detail. What makes it special? What are its key features?"
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

                            {/* Kitchen Layout Section */}
                            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-3xl p-8 border border-purple-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Kitchen Layout</h3>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Default Layout</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {layoutOptions.map(layout => (
                                            <button
                                                key={layout.type}
                                                type="button"
                                                onClick={() => setForm({ ...form, defaultLayout: layout })}
                                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${form.defaultLayout?.type === layout.type
                                                    ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-orange-200'
                                                    : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-orange-300 hover:bg-white/70'
                                                    }`}
                                            >
                                                <div className="font-bold text-gray-900 mb-2">{layout.name}</div>
                                                <div className="text-sm text-gray-600">{layout.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Choose the default layout for this kitchen product</p>
                                </div>
                            </div>

                            {/* Materials & Components Section */}
                            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Materials & Components</h3>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Default Materials</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-auto bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                                            {materialOptions.map((m, i) => {
                                                const key = `${m.category}-${m.material}-${i}`;
                                                const selected = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                                                return (
                                                    <label key={key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 transition-all duration-200 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => {
                                                                const exists = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                                                                setForm({
                                                                    ...form,
                                                                    defaultMaterials: exists
                                                                        ? form.defaultMaterials.filter(x => !(x.category === m.category && x.material === m.material))
                                                                        : [...form.defaultMaterials, m]
                                                                });
                                                            }}
                                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">{m.category} • {m.material}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Default Appliances</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {applianceOptions.map(appliance => {
                                                const selected = form.defaultAppliances.some(x => x.id === appliance.id);
                                                return (
                                                    <label key={appliance.id} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/70 transition-all duration-200 cursor-pointer bg-white/50 backdrop-blur-sm border border-white/30">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => {
                                                                const exists = form.defaultAppliances.some(x => x.id === appliance.id);
                                                                setForm({
                                                                    ...form,
                                                                    defaultAppliances: exists
                                                                        ? form.defaultAppliances.filter(x => x.id !== appliance.id)
                                                                        : [...form.defaultAppliances, appliance]
                                                                });
                                                            }}
                                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">{appliance.name} {appliance.essential && <span className="text-orange-600 font-bold">(Essential)</span>}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Default Features</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {featureOptions.map(feature => {
                                                const selected = form.defaultFeatures.some(x => x.id === feature.id);
                                                return (
                                                    <label key={feature.id} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/70 transition-all duration-200 cursor-pointer bg-white/50 backdrop-blur-sm border border-white/30">
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => {
                                                                const exists = form.defaultFeatures.some(x => x.id === feature.id);
                                                                setForm({
                                                                    ...form,
                                                                    defaultFeatures: exists
                                                                        ? form.defaultFeatures.filter(x => x.id !== feature.id)
                                                                        : [...form.defaultFeatures, feature]
                                                                });
                                                            }}
                                                            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kitchen Metadata Section */}
                            <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-3xl p-8 border border-indigo-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">Kitchen Specifications</h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-4">Suitable For</label>
                                            <div className="flex flex-wrap gap-3">
                                                {suitableForOptions.map(option => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            const exists = form.kitchenMetadata.suitableFor.includes(option);
                                                            setForm({
                                                                ...form,
                                                                kitchenMetadata: {
                                                                    ...form.kitchenMetadata,
                                                                    suitableFor: exists
                                                                        ? form.kitchenMetadata.suitableFor.filter(x => x !== option)
                                                                        : [...form.kitchenMetadata.suitableFor, option]
                                                                }
                                                            });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${form.kitchenMetadata.suitableFor.includes(option)
                                                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-300'
                                                            : 'bg-white/50 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-white/70'
                                                            }`}
                                                    >
                                                        {option.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-4">Style</label>
                                            <div className="flex flex-wrap gap-3">
                                                {styleOptions.map(option => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            const exists = form.kitchenMetadata.style.includes(option);
                                                            setForm({
                                                                ...form,
                                                                kitchenMetadata: {
                                                                    ...form.kitchenMetadata,
                                                                    style: exists
                                                                        ? form.kitchenMetadata.style.filter(x => x !== option)
                                                                        : [...form.kitchenMetadata.style, option]
                                                                }
                                                            });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${form.kitchenMetadata.style.includes(option)
                                                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-300'
                                                            : 'bg-white/50 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-white/70'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Color Scheme</label>
                                        <div className="flex flex-wrap gap-3">
                                            {colorSchemeOptions.map(option => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        const exists = form.kitchenMetadata.colorScheme.includes(option);
                                                        setForm({
                                                            ...form,
                                                            kitchenMetadata: {
                                                                ...form.kitchenMetadata,
                                                                colorScheme: exists
                                                                    ? form.kitchenMetadata.colorScheme.filter(x => x !== option)
                                                                    : [...form.kitchenMetadata.colorScheme, option]
                                                            }
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${form.kitchenMetadata.colorScheme.includes(option)
                                                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-2 border-orange-300'
                                                        : 'bg-white/50 backdrop-blur-sm text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:bg-white/70'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Delivery Time</label>
                                            <input
                                                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                                value={form.kitchenMetadata.deliveryTime}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    kitchenMetadata: { ...form.kitchenMetadata, deliveryTime: e.target.value }
                                                })}
                                                placeholder="e.g., 15-20 days"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Warranty</label>
                                            <input
                                                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                                value={form.kitchenMetadata.warranty}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    kitchenMetadata: { ...form.kitchenMetadata, warranty: e.target.value }
                                                })}
                                                placeholder="e.g., 2 years"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-3xl p-8 border border-pink-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-rose-900 bg-clip-text text-transparent">Product Images</h3>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Upload Images</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-pink-400 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70">
                                        <input
                                            key={editing ? `edit-${editing._id}` : 'new-kitchen-product'}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {editing ? 'Click to add new images' : 'Click to upload product images'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {editing ?
                                                            'Replace existing images (optional)' :
                                                            'Upload multiple images for your kitchen product gallery'
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

                                    {/* Existing Images Display (for editing) */}
                                    {editing && editing.mainImages && editing.mainImages.length > 0 && (
                                        <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 shadow-lg">
                                            <p className="text-sm font-bold text-gray-700 mb-4">Current images:</p>
                                            <div className="flex flex-wrap gap-4">
                                                {editing.mainImages.map((img, index) => (
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

                            {/* Form Buttons */}
                            <div className="flex justify-end gap-6 pt-8 border-t border-white/20">
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                    className="px-8 py-4 border-2 border-gray-200 rounded-2xl text-gray-700 hover:bg-white/50 hover:border-gray-300 transition-all duration-200 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none flex items-center gap-3"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {editing ? 'Update Kitchen Product' : 'Create Kitchen Product'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Modern Kitchen Products Table */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-8 border-b border-white/20 bg-gradient-to-r from-orange-50/50 to-amber-50/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center">
                                    <ChefHat className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">
                                        Kitchen Products
                                    </h3>
                                    <p className="text-gray-600 mt-1 text-lg">
                                        {items.length} kitchen products in your catalog
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl shadow-lg">
                                    <ChefHat className="w-5 h-5 text-orange-600" />
                                    <span className="text-orange-700 font-bold text-sm">
                                        {items.filter(p => p.hasVariants).length} with variants
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-amber-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                                <ChefHat className="w-14 h-14 text-orange-600" />
                            </div>
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent mb-4">No kitchen products yet</h3>
                            <p className="text-gray-600 mb-10 max-w-lg mx-auto text-lg">
                                Start building your kitchen catalog by adding your first kitchen product. It's easy and takes just a few minutes!
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
                                className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
                            >
                                <Plus size={24} />
                                Create Your First Kitchen Product
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
                                            Layout
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
                                                                <ChefHat size={20} className="text-gray-400" />
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
                                                    {item.defaultLayout?.name || 'Not specified'}
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
                                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-medium rounded-full w-fit">
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
