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

    const resetForm = () => {
        setForm({
            name: '', slug: '', description: '', basePrice: '', mrp: '', discount: '', mainImages: [],
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
            mainImages: [],
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
                <div className="px-6 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">2BHK Packages</h1>
                        <p className="text-gray-600">Manage complete 2BHK interior packages</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-purple-500 flex items-center to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow"
                    >
                        <Plus size={18} /> Add 2BHK Package
                    </button>
                </div>
            </div>

            <div className="py-6 space-y-6">
                {error && <div className="mx-6 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>}

                {showForm && (
                    <div className="mx-6 bg-white rounded-2xl border p-6 shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="font-semibold text-lg">{editing ? 'Edit' : 'Add'} 2BHK Package</div>
                            <button
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => { setShowForm(false); resetForm(); }}
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        onBlur={() => generateSlug(form.name)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Base Price *</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={form.basePrice}
                                        onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">MRP</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={form.mrp}
                                        onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount %</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={form.discount}
                                        onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full border rounded px-3 py-2"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Kitchen Layout *</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={form.kitchenLayout}
                                        onChange={(e) => setForm({ ...form, kitchenLayout: e.target.value })}
                                        required
                                    >
                                        {layoutOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Master Bedroom Wardrobe *</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={form.wardrobe1Type}
                                        onChange={(e) => setForm({ ...form, wardrobe1Type: e.target.value })}
                                        required
                                    >
                                        {wardrobeTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Second Bedroom Wardrobe *</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={form.wardrobe2Type}
                                        onChange={(e) => setForm({ ...form, wardrobe2Type: e.target.value })}
                                        required
                                    >
                                        {wardrobeTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Materials</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-auto border rounded p-3">
                                    {materialOptions.map((material, i) => (
                                        <label key={i} className="flex items-center gap-2 text-sm">
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
                                            />
                                            <span>{material}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Features</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {featureOptions.map(feature => (
                                        <label key={feature.id} className="flex items-center gap-2 text-sm">
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
                                            />
                                            <span>{feature.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Package Inclusions</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {inclusionOptions.map((inclusion, i) => (
                                        <label key={i} className="flex items-center gap-2 text-sm">
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
                                            />
                                            <span>{inclusion.item} ({inclusion.category})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Package Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Suitable For</label>
                                    <div className="flex flex-wrap gap-2">
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
                                                className={`px-3 py-1 rounded text-sm ${form.packageMetadata.suitableFor.includes(option)
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Style</label>
                                    <div className="flex flex-wrap gap-2">
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
                                                className={`px-3 py-1 rounded text-sm ${form.packageMetadata.style.includes(option)
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                                <div className="flex flex-wrap gap-2">
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
                                            className={`px-3 py-1 rounded text-sm ${form.packageMetadata.colorScheme.includes(option)
                                                ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Delivery Time</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.packageMetadata.deliveryTime}
                                        onChange={(e) => setForm({
                                            ...form,
                                            packageMetadata: { ...form.packageMetadata, deliveryTime: e.target.value }
                                        })}
                                        placeholder="e.g., 20-25 days"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Warranty</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.packageMetadata.warranty}
                                        onChange={(e) => setForm({
                                            ...form,
                                            packageMetadata: { ...form.packageMetadata, warranty: e.target.value }
                                        })}
                                        placeholder="e.g., 2 years"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setForm({ ...form, mainImages: files });
                                    }}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 border rounded"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mx-6 bg-white rounded-2xl border overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-700">
                            <Package size={16} />
                            <span className="font-semibold">{items.length} packages</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Package</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Kitchen</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Wardrobes</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {items.map(item => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded overflow-hidden bg-gray-100">
                                                    {item.mainImages?.[0] ? (
                                                        <img src={item.mainImages[0]} alt={item.name} className="h-12 w-12 object-cover" />
                                                    ) : (
                                                        <div className="h-12 w-12 flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500">{item.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {item.kitchenLayout || '-'}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {item.wardrobe1Type} + {item.wardrobe2Type}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">₹{item.basePrice || 0}</td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-700"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 text-xs rounded bg-red-50 text-red-700"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    <Trash2 size={14} /> Delete
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

