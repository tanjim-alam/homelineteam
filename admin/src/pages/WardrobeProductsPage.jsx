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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Wardrobe Products</h1>
            <p className="text-gray-600">Manage dynamic wardrobe catalog</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-violet-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center shadow"> <Plus size={18} /> Add Wardrobe </button>
        </div>
      </div>

      <div className="py-6 space-y-6">
        {error && <div className="mx-6 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>}

        {showForm && (
          <div className="mx-6 bg-white rounded-2xl border p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">{editing ? 'Edit' : 'Add'} Wardrobe</div>
              <button className="text-gray-600 hover:text-gray-900" onClick={() => { setShowForm(false); resetForm(); }}>Close</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input className="w-full border rounded px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => generateSlug(form.name)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input className="w-full border rounded px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Base Price *</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MRP</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount %</label>
                  <input type="number" className="w-full border rounded px-3 py-2" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} min="0" max="100" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full border rounded px-3 py-2" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Opening Type</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['sliding', 'swinging'].map(t => (
                    <button type="button" key={t} onClick={() => setForm({ ...form, defaultOpening: t })} className={`px-3 py-1.5 rounded border text-sm ${form.defaultOpening === t ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}>{t}</button>
                  ))}
                </div>
                <label className="block text-sm font-medium mb-2">Default Type</label>
                <div className="flex flex-wrap gap-2">
                  {['2-door', '3-door', '4-door', '5-door', 'sliding'].map(t => (
                    <button type="button" key={t} onClick={() => setForm({ ...form, defaultType: t })} className={`px-3 py-1.5 rounded border text-sm ${form.defaultType === t ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Features</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {featureOptions.map(f => {
                    const selected = form.defaultFeatures.some(x => x.id === f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selected} onChange={() => {
                          const exists = form.defaultFeatures.some(x => x.id === f.id);
                          setForm({ ...form, defaultFeatures: exists ? form.defaultFeatures.filter(x => x.id !== f.id) : [...form.defaultFeatures, f] });
                        }} />
                        <span>{f.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Materials</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-44 overflow-auto border rounded p-3">
                  {materialOptions.map((m, i) => {
                    const key = `${m.category}-${m.material}-${i}`;
                    const selected = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                    return (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={selected} onChange={() => {
                          const exists = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                          setForm({ ...form, defaultMaterials: exists ? form.defaultMaterials.filter(x => !(x.category === m.category && x.material === m.material)) : [...form.defaultMaterials, m] });
                        }} />
                        <span>{m.category} • {m.material}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Images</label>
                <input type="file" multiple accept="image/*" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setForm({ ...form, mainImages: files });
                }} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="px-4 py-2 border rounded" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 bg-violet-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        )}

        <div className="mx-6 bg-white rounded-2xl border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 text-violet-700"><Layers size={16} /> <span className="font-semibold">{items.length} items</span></div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Variants</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded overflow-hidden bg-gray-100">
                          {item.mainImages?.[0] ? <img src={item.mainImages[0]} alt={item.name} className="h-12 w-12 object-cover" /> : <div className="h-12 w-12 flex items-center justify-center text-gray-400">WR</div>}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{item.defaultType || '-'}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">₹{item.basePrice || 0}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{item.hasVariants ? (item.variants?.length || 0) : 0}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-700" onClick={() => handleEdit(item)}><Edit size={14} /> Edit</button>
                        <button className="px-3 py-1.5 text-xs rounded bg-red-50 text-red-700" onClick={() => handleDelete(item._id)}><Trash2 size={14} /> Delete</button>
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


