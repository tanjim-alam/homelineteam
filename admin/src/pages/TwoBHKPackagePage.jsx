'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Home, ChefHat } from 'lucide-react';
import apiClient from '../api/client';

export default function TwoBHKPackagePage() {
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
        category: '2bhk-package',
        kitchenLayout: 'l-shape',
        wardrobe1Type: '3-door',
        wardrobe2Type: '4-door',
        materials: [],
        features: [],
        inclusions: [],
        availableLayouts: [],
        availableWardrobeTypes: [],
        availableMaterials: [],
        availableFeatures: [],
        hasVariants: false,
        variants: [],
        variantOptions: {},
        dynamicFields: {},
        packageMetadata: {
            suitableFor: [],
            style: [],
            colorScheme: [],
            deliveryTime: '',
            warranty: '',
            budget: { min: '', max: '' },
            installation: { included: false, cost: '' },
            area: { min: '', max: '' },
            rooms: {
                kitchen: true,
                bedroom1: true,
                bedroom2: true,
                living: true,
                dining: false
            }
        },
        metaData: { title: '', description: '', keywords: '', ogImage: null },
        tags: ''
    });

    const layoutOptions = [
        { value: 'straight', label: 'Straight Layout' },
        { value: 'l-shape', label: 'L-Shape Layout' },
        { value: 'parallel', label: 'Parallel Layout' },
        { value: 'u-shape', label: 'U-Shape Layout' },
        { value: 'island', label: 'Island Layout' }
    ];

    const wardrobeTypeOptions = [
        { value: '2-door', label: '2 Door' },
        { value: '3-door', label: '3 Door' },
        { value: '4-door', label: '4 Door' },
        { value: '5-door', label: '5 Door' },
        { value: 'sliding', label: 'Sliding' }
    ];

    const materialOptions = [
        'Plywood', 'MDF', 'Particle Board', 'Granite', 'Quartz', 'Marble',
        'Laminate', 'Tiles', 'Glass', 'Ceramic Tiles', 'Vitrified Tiles',
        'Soft Close Hinges', 'Standard Hinges', 'Wood', 'Metal', 'Acrylic'
    ];

    const featureOptions = [
        { id: 'led-lighting', name: 'LED Lighting', category: 'lighting' },
        { id: 'soft-close', name: 'Soft Close Drawers', category: 'hardware' },
        { id: 'pull-out', name: 'Pull-out Storage', category: 'storage' },
        { id: 'corner-solution', name: 'Corner Solutions', category: 'storage' },
        { id: 'tall-unit', name: 'Tall Storage Unit', category: 'storage' },
        { id: 'breakfast-counter', name: 'Breakfast Counter', category: 'convenience' },
        { id: 'island', name: 'Kitchen Island', category: 'kitchen' },
        { id: 'pantry', name: 'Pantry Storage', category: 'storage' },
        { id: 'walk-in-wardrobe', name: 'Walk-in Wardrobe', category: 'wardrobe' },
        { id: 'built-in-storage', name: 'Built-in Storage', category: 'storage' }
    ];

    const inclusionOptions = [
        { item: 'Modular Kitchen', category: 'kitchen', quantity: 1 },
        { item: 'Master Bedroom Wardrobe', category: 'wardrobe', quantity: 1 },
        { item: 'Second Bedroom Wardrobe', category: 'wardrobe', quantity: 1 },
        { item: 'Kitchen Sink', category: 'kitchen', quantity: 1 },
        { item: 'Faucet', category: 'kitchen', quantity: 1 },
        { item: 'Chimney', category: 'kitchen', quantity: 1 },
        { item: 'Gas Hob', category: 'kitchen', quantity: 1 },
        { item: 'LED Lights', category: 'lighting', quantity: 6 },
        { item: 'Soft Close Hinges', category: 'hardware', quantity: 1 },
        { item: 'Living Room Storage', category: 'furniture', quantity: 1 }
    ];

    const styleOptions = ['modern', 'traditional', 'contemporary', 'minimalist', 'industrial', 'scandinavian'];
    const colorSchemeOptions = ['white', 'wood', 'grey', 'colorful', 'black', 'neutral'];
    const suitableForOptions = ['2bhk', 'family', 'couple-with-kids', 'working-professionals', 'extended-family'];

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/2bhk-packages');
            const data = res?.data || res;
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            setError('Failed to load 2BHK packages');
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
            category: '2bhk-package', kitchenLayout: 'l-shape', wardrobe1Type: '3-door', wardrobe2Type: '4-door',
            materials: [], features: [], inclusions: [],
            availableLayouts: [], availableWardrobeTypes: [], availableMaterials: [], availableFeatures: [],
            hasVariants: false, variants: [], variantOptions: {}, dynamicFields: {},
            packageMetadata: {
                suitableFor: [], style: [], colorScheme: [], deliveryTime: '', warranty: '',
                budget: { min: '', max: '' }, installation: { included: false, cost: '' },
                area: { min: '', max: '' },
                rooms: {
                    kitchen: true,
                    bedroom1: true,
                    bedroom2: true,
                    living: true,
                    dining: false
                }
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
            fd.append('kitchenLayout', form.kitchenLayout);
            fd.append('wardrobe1Type', form.wardrobe1Type);
            fd.append('wardrobe2Type', form.wardrobe2Type);
            fd.append('materials', JSON.stringify(form.materials));
            fd.append('features', JSON.stringify(form.features));
            fd.append('inclusions', JSON.stringify(form.inclusions));
            fd.append('availableLayouts', JSON.stringify(form.availableLayouts));
            fd.append('availableWardrobeTypes', JSON.stringify(form.availableWardrobeTypes));
            fd.append('availableMaterials', JSON.stringify(form.availableMaterials));
            fd.append('availableFeatures', JSON.stringify(form.availableFeatures));
            fd.append('hasVariants', form.hasVariants);
            fd.append('variants', JSON.stringify(form.variants));
            fd.append('variantOptions', JSON.stringify(form.variantOptions));
            fd.append('dynamicFields', JSON.stringify(form.dynamicFields));
            fd.append('packageMetadata', JSON.stringify(form.packageMetadata));
            fd.append('metaData[title]', form.metaData.title || '');
            fd.append('metaData[description]', form.metaData.description || '');
            fd.append('metaData[keywords]', form.metaData.keywords || '');
            fd.append('tags', form.tags);
            if (form.mainImages?.length) {
                const files = form.mainImages.filter(f => f instanceof File);
                files.forEach(f => fd.append('images', f));
            }

            if (editing) {
                await apiClient.put(`/api/2bhk-packages/${editing._id}`, fd);
            } else {
                await apiClient.post('/api/2bhk-packages', fd);
            }
            setShowForm(false);
            resetForm();
            fetchItems();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to save 2BHK package');
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
            category: item.category || '2bhk-package',
            kitchenLayout: item.kitchenLayout || 'l-shape',
            wardrobe1Type: item.wardrobe1Type || '3-door',
            wardrobe2Type: item.wardrobe2Type || '4-door',
            materials: item.materials || [],
            features: item.features || [],
            inclusions: item.inclusions || [],
            availableLayouts: item.availableLayouts || [],
            availableWardrobeTypes: item.availableWardrobeTypes || [],
            availableMaterials: item.availableMaterials || [],
            availableFeatures: item.availableFeatures || [],
            hasVariants: item.hasVariants || false,
            variants: item.variants || [],
            variantOptions: item.variantOptions || {},
            dynamicFields: item.dynamicFields || {},
            packageMetadata: item.packageMetadata || {
                suitableFor: [], style: [], colorScheme: [], deliveryTime: '', warranty: '',
                budget: { min: '', max: '' }, installation: { included: false, cost: '' },
                area: { min: '', max: '' },
                rooms: {
                    kitchen: true,
                    bedroom1: true,
                    bedroom2: true,
                    living: true,
                    dining: false
                }
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
        if (!window.confirm('Delete this 2BHK package?')) return;
        try {
            await apiClient.delete(`/api/2bhk-packages/${id}`);
            fetchItems();
        } catch (e) {
            setError('Failed to delete 2BHK package');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Modern Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent mb-2">
                                2BHK Packages
                            </h1>
                            <p className="text-lg text-gray-600">Manage complete 2BHK interior design packages</p>
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
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                        >
                            <Plus size={20} />
                            Add 2BHK Package
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
                        <div className="p-8 border-b border-white/20 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                            {editing ? 'Edit 2BHK Package' : 'Add New 2BHK Package'}
                                        </h2>
                                        <p className="text-gray-600 mt-1 text-lg">
                                            {editing ? 'Update your 2BHK package information' : 'Create a new 2BHK interior design package'}
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
                            <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-3xl p-8 border border-purple-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Basic Information</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Package Name *</label>
                                        <input
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            onBlur={() => generateSlug(form.name)}
                                            placeholder="Enter 2BHK package name"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 font-medium">This will be the main title of your 2BHK package</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Package URL (Slug) *</label>
                                        <input
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            placeholder="2bhk-package-url-slug"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 font-medium">This creates the URL for your package page (auto-generated from name)</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Package Description</label>
                                    <textarea
                                        className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                        rows={4}
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Describe your 2BHK package in detail. What makes it special? What are its key features?"
                                    />
                                    <p className="text-xs text-gray-500 font-medium mt-2">Help customers understand what they're getting in this package</p>
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
                                        <label className="block text-sm font-bold text-gray-700">Package Price *</label>
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
                                        <p className="text-xs text-gray-500 font-medium">The total price customers will pay for this package</p>
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

                            {/* Package Configuration Section */}
                            <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-3xl p-8 border border-amber-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center">
                                        <Home className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">Package Configuration</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Kitchen Layout *</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.kitchenLayout}
                                            onChange={(e) => setForm({ ...form, kitchenLayout: e.target.value })}
                                            required
                                        >
                                            {layoutOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 font-medium">Choose the default kitchen layout for this package</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Master Bedroom Wardrobe *</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.wardrobe1Type}
                                            onChange={(e) => setForm({ ...form, wardrobe1Type: e.target.value })}
                                            required
                                        >
                                            {wardrobeTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 font-medium">Choose the master bedroom wardrobe type</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">Second Bedroom Wardrobe *</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                            value={form.wardrobe2Type}
                                            onChange={(e) => setForm({ ...form, wardrobe2Type: e.target.value })}
                                            required
                                        >
                                            {wardrobeTypeOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 font-medium">Choose the second bedroom wardrobe type</p>
                                    </div>
                                </div>
                            </div>

                            {/* Materials, Features & Inclusions Section */}
                            <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Materials, Features & Inclusions</h3>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Materials Used</label>
                                        <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 max-h-64 overflow-y-auto">
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {materialOptions.map((material, i) => (
                                                    <label key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/70 transition-all duration-200 bg-white/30 backdrop-blur-sm border cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.materials.includes(material)}
                                                            onChange={() => {
                                                                const exists = form.materials.includes(material);
                                                                setForm({
                                                                    ...form,
                                                                    materials: exists
                                                                        ? form.materials.filter(m => m !== material)
                                                                        : [...form.materials, material]
                                                                });
                                                            }}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">{material}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mt-3">Select the materials used in this package</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Package Features</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {featureOptions.map(feature => (
                                                <label key={feature.id} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/70 transition-all duration-200 bg-white/50 backdrop-blur-sm border cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.features.some(f => f.id === feature.id)}
                                                        onChange={() => {
                                                            const exists = form.features.some(f => f.id === feature.id);
                                                            setForm({
                                                                ...form,
                                                                features: exists
                                                                    ? form.features.filter(f => f.id !== feature.id)
                                                                    : [...form.features, feature]
                                                            });
                                                        }}
                                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mt-3">Select the features included in this package</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-4">Package Inclusions</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {inclusionOptions.map((inclusion, i) => (
                                                <label key={i} className="flex items-center gap-3 p-4 rounded-xl hover:bg-white/70 transition-all duration-200 bg-white/50 backdrop-blur-sm border cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.inclusions.some(inc => inc.item === inclusion.item)}
                                                        onChange={() => {
                                                            const exists = form.inclusions.some(inc => inc.item === inclusion.item);
                                                            setForm({
                                                                ...form,
                                                                inclusions: exists
                                                                    ? form.inclusions.filter(inc => inc.item !== inclusion.item)
                                                                    : [...form.inclusions, inclusion]
                                                            });
                                                        }}
                                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">{inclusion.item}</span>
                                                        <span className="text-xs text-gray-500 ml-2">({inclusion.category})</span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mt-3">Select what's included in this package</p>
                                    </div>
                                </div>
                            </div>

                            {/* Package Metadata Section */}
                            <div className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-3xl p-8 border border-violet-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">Package Metadata</h3>
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
                                                            const exists = form.packageMetadata.suitableFor.includes(option);
                                                            setForm({
                                                                ...form,
                                                                packageMetadata: {
                                                                    ...form.packageMetadata,
                                                                    suitableFor: exists
                                                                        ? form.packageMetadata.suitableFor.filter(x => x !== option)
                                                                        : [...form.packageMetadata.suitableFor, option]
                                                                }
                                                            });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${form.packageMetadata.suitableFor.includes(option)
                                                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-violet-200'
                                                            : 'bg-white/50 backdrop-blur-sm border border-gray-200 hover:border-violet-300 hover:bg-violet-50/50 text-gray-700'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mt-3">Select the target audience for this package</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-4">Design Style</label>
                                            <div className="flex flex-wrap gap-3">
                                                {styleOptions.map(option => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => {
                                                            const exists = form.packageMetadata.style.includes(option);
                                                            setForm({
                                                                ...form,
                                                                packageMetadata: {
                                                                    ...form.packageMetadata,
                                                                    style: exists
                                                                        ? form.packageMetadata.style.filter(x => x !== option)
                                                                        : [...form.packageMetadata.style, option]
                                                                }
                                                            });
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${form.packageMetadata.style.includes(option)
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-200'
                                                            : 'bg-white/50 backdrop-blur-sm border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-gray-700'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mt-3">Choose the design style for this package</p>
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
                                                        const exists = form.packageMetadata.colorScheme.includes(option);
                                                        setForm({
                                                            ...form,
                                                            packageMetadata: {
                                                                ...form.packageMetadata,
                                                                colorScheme: exists
                                                                    ? form.packageMetadata.colorScheme.filter(x => x !== option)
                                                                    : [...form.packageMetadata.colorScheme, option]
                                                            }
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${form.packageMetadata.colorScheme.includes(option)
                                                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-200'
                                                        : 'bg-white/50 backdrop-blur-sm border border-gray-200 hover:border-pink-300 hover:bg-pink-50/50 text-gray-700'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium mt-3">Select the color schemes available for this package</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Delivery Time</label>
                                            <input
                                                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                                value={form.packageMetadata.deliveryTime}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    packageMetadata: { ...form.packageMetadata, deliveryTime: e.target.value }
                                                })}
                                                placeholder="e.g., 20-25 days"
                                            />
                                            <p className="text-xs text-gray-500 font-medium">Expected delivery timeframe</p>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="block text-sm font-bold text-gray-700">Warranty</label>
                                            <input
                                                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white shadow-lg"
                                                value={form.packageMetadata.warranty}
                                                onChange={(e) => setForm({
                                                    ...form,
                                                    packageMetadata: { ...form.packageMetadata, warranty: e.target.value }
                                                })}
                                                placeholder="e.g., 2 years"
                                            />
                                            <p className="text-xs text-gray-500 font-medium">Warranty period for this package</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Package Images Section */}
                            <div className="bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-3xl p-8 border border-pink-100/50 shadow-lg">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-rose-900 bg-clip-text text-transparent">Package Images</h3>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700">Upload Images</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center hover:border-pink-400 transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70">
                                        <input
                                            key={editing ? `edit-${editing._id}` : 'new-2bhk-package'}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="package-image-upload"
                                        />
                                        <label htmlFor="package-image-upload" className="cursor-pointer">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-200 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {editing ? 'Click to add new images' : 'Click to upload package images'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        {editing ?
                                                            'Replace existing images (optional)' :
                                                            'Upload multiple images for your 2BHK package gallery'
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

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    type="button"
                                    className="px-8 py-4 border-2 border-gray-300 rounded-2xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            {editing ? 'Update Package' : 'Create Package'}
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Modern Packages List */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-8 border-b border-white/20 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                    2BHK Packages
                                </h2>
                                <p className="text-gray-600 mt-1 text-lg">Manage your complete 2BHK interior design packages</p>
                            </div>
                            <div className="ml-auto">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                                    <Package size={20} className="text-purple-600" />
                                    <span className="font-bold text-purple-700">{items.length} packages</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Package</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kitchen Layout</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wardrobes</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price & Offers</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
                                                            <Home size={20} className="text-gray-400" />
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
                                                {item.kitchenLayout || 'Not specified'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Master: {item.wardrobe1Type || 'Not specified'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Second: {item.wardrobe2Type || 'Not specified'}</span>
                                                </div>
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
                </div>
            </div>
        </div>
    );
}

