import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Trash2, X, Eye, Home, ToggleLeft, ToggleRight } from 'lucide-react';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';

const KITCHEN_LAYOUTS = [
  { type: 'straight', name: 'Straight', description: 'Single-wall design' },
  { type: 'l-shape',  name: 'L-Shape',  description: 'Corner design' },
  { type: 'u-shape',  name: 'U-Shape',  description: 'Three-wall design' },
  { type: 'parallel', name: 'Parallel', description: 'Two-wall design' },
  { type: 'island',   name: 'Island',   description: 'Island kitchen' },
];

const WARDROBE_TYPES = [
  { type: '2-door',  name: '2-Door',  description: 'Two panel door' },
  { type: '3-door',  name: '3-Door',  description: 'Three panel door' },
  { type: '4-door',  name: '4-Door',  description: 'Four panel door' },
  { type: '5-door',  name: '5-Door',  description: 'Five panel door' },
  { type: 'sliding', name: 'Sliding', description: 'Sliding door' },
];

const MATERIAL_OPTIONS = [
  'Plywood', 'MDF', 'Particle Board', 'Granite', 'Quartz', 'Marble',
  'Laminate', 'Tiles', 'Glass', 'Acrylic', 'Veneer', 'SS Hardware',
];

const FEATURE_OPTIONS = [
  { id: 'led-lighting',      name: 'LED Lighting',        category: 'lighting' },
  { id: 'soft-close',        name: 'Soft Close Drawers',  category: 'hardware' },
  { id: 'pull-out',          name: 'Pull-out Storage',    category: 'storage' },
  { id: 'corner-solution',   name: 'Corner Solutions',    category: 'storage' },
  { id: 'tall-unit',         name: 'Tall Storage Unit',   category: 'storage' },
  { id: 'breakfast-counter', name: 'Breakfast Counter',   category: 'convenience' },
  { id: 'island',            name: 'Kitchen Island',      category: 'kitchen' },
  { id: 'pantry',            name: 'Pantry Storage',      category: 'storage' },
  { id: 'walk-in-wardrobe',  name: 'Walk-in Wardrobe',    category: 'wardrobe' },
  { id: 'built-in-storage',  name: 'Built-in Storage',    category: 'storage' },
];

const INCLUSION_OPTIONS = [
  { item: 'Modular Kitchen',         category: 'kitchen',   quantity: 1 },
  { item: 'Master Bedroom Wardrobe', category: 'wardrobe',  quantity: 1 },
  { item: 'Second Bedroom Wardrobe', category: 'wardrobe',  quantity: 1 },
  { item: 'Kitchen Sink',            category: 'kitchen',   quantity: 1 },
  { item: 'Faucet',                  category: 'kitchen',   quantity: 1 },
  { item: 'Chimney',                 category: 'kitchen',   quantity: 1 },
  { item: 'Gas Hob',                 category: 'kitchen',   quantity: 1 },
  { item: 'LED Lights',              category: 'lighting',  quantity: 6 },
  { item: 'Soft Close Hinges',       category: 'hardware',  quantity: 1 },
  { item: 'Living Room Storage',     category: 'furniture', quantity: 1 },
];

const STYLE_OPTIONS  = ['modern', 'traditional', 'contemporary', 'minimalist', 'industrial', 'scandinavian'];
const COLOR_OPTIONS  = ['white', 'wood', 'grey', 'colorful', 'black', 'neutral'];
const SUITABLE_FOR   = ['2bhk', '2bhk+study', 'small-family', 'couple', 'family'];

const EMPTY_FORM = {
  name: '', slug: '', description: '',
  basePrice: '', mrp: '', discount: '',
  mainImages: [], imagePreviews: [],
  category: '2bhk-package',
  kitchenLayout: 'l-shape',
  wardrobe1Type: '3-door',
  wardrobe2Type: '3-door',
  materials: [], features: [], inclusions: [],
  availableLayouts: [], availableWardrobeTypes: [], availableMaterials: [], availableFeatures: [],
  hasVariants: false,
  variants: [],
  variantOptions: {}, dynamicFields: {},
  packageMetadata: {
    suitableFor: [], style: [], colorScheme: [],
    deliveryTime: '', warranty: '',
    area: { min: '', max: '' },
  },
  metaData: { title: '', description: '', keywords: '' },
  tags: '',
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent';

const TagToggle = ({ values, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {values.map(v => (
      <button
        key={v}
        type="button"
        onClick={() => onToggle(v)}
        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
          selected.includes(v)
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
        }`}
      >
        {v}
      </button>
    ))}
  </div>
);

export default function TwoBHKPackagePage() {
  const [items, setItems]       = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPM = (k, v) => setForm(f => ({ ...f, packageMetadata: { ...f.packageMetadata, [k]: v } }));

  const toggleArr = (arr, val) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res  = await apiClient.get('/2bhk-packages');
      const data = res?.data || res;
      setItems(Array.isArray(data) ? data : []);
    } catch {
      showToast('error', 'Failed to load 2BHK packages');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = name => {
    if (!name) return;
    set('slug', name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
  };

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = item => {
    setEditing(item);
    setForm({
      ...EMPTY_FORM,
      name:              item.name,
      slug:              item.slug,
      description:       item.description || '',
      basePrice:         item.basePrice ?? '',
      mrp:               item.mrp ?? '',
      discount:          item.discount ?? '',
      mainImages:        [],
      imagePreviews:     [],
      category:          item.category || '2bhk-package',
      kitchenLayout:     item.kitchenLayout || 'l-shape',
      wardrobe1Type:     item.wardrobe1Type || '3-door',
      wardrobe2Type:     item.wardrobe2Type || '3-door',
      materials:         item.materials || [],
      features:          item.features || [],
      inclusions:        item.inclusions || [],
      availableLayouts:  item.availableLayouts || [],
      availableWardrobeTypes: item.availableWardrobeTypes || [],
      availableMaterials: item.availableMaterials || [],
      availableFeatures:  item.availableFeatures || [],
      hasVariants:       item.hasVariants || false,
      variants:          item.variants || [],
      variantOptions:    item.variantOptions || {},
      dynamicFields:     item.dynamicFields || {},
      packageMetadata:   item.packageMetadata || EMPTY_FORM.packageMetadata,
      metaData: {
        title:       item.metaData?.title || '',
        description: item.metaData?.description || '',
        keywords:    Array.isArray(item.metaData?.keywords)
                       ? item.metaData.keywords.join(', ')
                       : (item.metaData?.keywords || ''),
      },
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    set('mainImages', files);
    set('imagePreviews', files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name',          form.name);
      fd.append('slug',          form.slug);
      fd.append('description',   form.description);
      fd.append('basePrice',     form.basePrice);
      fd.append('mrp',           form.mrp);
      fd.append('discount',      form.discount);
      fd.append('category',      form.category);
      fd.append('kitchenLayout', form.kitchenLayout);
      fd.append('wardrobe1Type', form.wardrobe1Type);
      fd.append('wardrobe2Type', form.wardrobe2Type);
      fd.append('materials',     JSON.stringify(form.materials));
      fd.append('features',      JSON.stringify(form.features));
      fd.append('inclusions',    JSON.stringify(form.inclusions));
      fd.append('availableLayouts',       JSON.stringify(form.availableLayouts));
      fd.append('availableWardrobeTypes', JSON.stringify(form.availableWardrobeTypes));
      fd.append('availableMaterials',     JSON.stringify(form.availableMaterials));
      fd.append('availableFeatures',      JSON.stringify(form.availableFeatures));
      fd.append('hasVariants',   String(form.hasVariants));
      fd.append('variants',      JSON.stringify(form.variants.map(v => ({
        ...v,
        price: Number(v.price) || 0,
        mrp:   Number(v.mrp)   || 0,
        stock: Number(v.stock) || 0,
      }))));
      fd.append('variantOptions',  JSON.stringify(form.variantOptions));
      fd.append('dynamicFields',   JSON.stringify(form.dynamicFields));
      fd.append('packageMetadata', JSON.stringify(form.packageMetadata));
      fd.append('metaData',        JSON.stringify(form.metaData));
      fd.append('tags',            form.tags);
      form.mainImages.filter(f => f instanceof File).forEach(f => fd.append('images', f));

      if (editing) {
        await apiClient.put(`/2bhk-packages/${editing._id}`, fd);
      } else {
        await apiClient.post('/2bhk-packages', fd);
      }
      closeForm();
      fetchItems();
      showToast('success', editing ? '2BHK package updated' : '2BHK package created');
    } catch (e) {
      showToast('error', e?.response?.data?.message || 'Failed to save 2BHK package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this 2BHK package?')) return;
    try {
      await apiClient.delete(`/2bhk-packages/${id}`);
      fetchItems();
      showToast('success', '2BHK package deleted');
    } catch {
      showToast('error', 'Failed to delete 2BHK package');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">2BHK Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage complete 2BHK interior design packages</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add 2BHK Package
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="font-semibold text-gray-900">All Packages</h2>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{items.length} packages</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kitchen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Wardrobes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Variants</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No 2BHK packages yet. Click &quot;Add 2BHK Package&quot; to create one.
                  </td>
                </tr>
              ) : items.map(item => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.mainImages?.[0]
                          ? <img src={item.mainImages[0]} alt={item.name} className="w-10 h-10 object-cover" />
                          : <div className="w-10 h-10 flex items-center justify-center"><Home className="w-4 h-4 text-gray-400" /></div>
                        }
                      </div>
                      <div className="max-w-[200px]">
                        <div className="text-sm font-semibold text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400 truncate">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">₹{(item.basePrice || 0).toLocaleString()}</div>
                    {item.mrp > item.basePrice && <div className="text-xs text-gray-400 line-through">₹{item.mrp.toLocaleString()}</div>}
                    {item.discount > 0 && <div className="text-xs text-green-600 font-medium">{item.discount}% off</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium capitalize">
                      {item.kitchenLayout || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-700 whitespace-nowrap">
                      {item.wardrobe1Type || '—'} / {item.wardrobe2Type || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.hasVariants && item.variants?.length > 0 ? (
                      <span className="inline-block px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold whitespace-nowrap">
                        {item.variants.length} variant{item.variants.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewItem(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Form Panel */}
      {showForm && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={closeForm} />
          <div style={{
            width: '100%', maxWidth: '42rem', height: '100%',
            background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          }}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Home className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="font-bold text-gray-900">{editing ? 'Edit 2BHK Package' : 'New 2BHK Package'}</h2>
              </div>
              <button onClick={closeForm} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 px-6 py-5 space-y-6">

              {/* Basic Info */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Basic Information</h3>
                <div className="space-y-3">
                  <Field label="Package Name *">
                    <input
                      className={inp}
                      value={form.name}
                      onChange={e => set('name', e.target.value)}
                      onBlur={() => !editing && generateSlug(form.name)}
                      placeholder="e.g. Premium 2BHK Package"
                      required
                    />
                  </Field>
                  <Field label="Slug *">
                    <input className={inp} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="premium-2bhk-package" required />
                  </Field>
                  <Field label="Description">
                    <textarea className={inp} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe this package..." />
                  </Field>
                  <Field label="Category">
                    <input className={inp} value={form.category} onChange={e => set('category', e.target.value)} />
                  </Field>
                  <Field label="Tags (comma-separated)">
                    <input className={inp} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="2bhk, modern, complete" />
                  </Field>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Pricing</h3>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Base Price *">
                    <input type="number" className={inp} value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="0" required />
                  </Field>
                  <Field label="MRP">
                    <input type="number" className={inp} value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0" />
                  </Field>
                  <Field label="Discount %">
                    <input type="number" className={inp} value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0" min="0" max="100" />
                  </Field>
                </div>
              </section>

              {/* Images */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Images</h3>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
                  <span className="text-xs text-gray-500">{editing ? 'Upload new images (optional)' : 'Click to upload images'}</span>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                </label>
                {form.imagePreviews?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {form.imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => {
                            set('mainImages', form.mainImages.filter((_, j) => j !== i));
                            set('imagePreviews', form.imagePreviews.filter((_, j) => j !== i));
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs leading-none"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
                {editing?.mainImages?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Current images:</p>
                    <div className="flex gap-2 flex-wrap">
                      {editing.mainImages.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200 opacity-60" />
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Package Configuration */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Package Configuration</h3>
                <div className="space-y-4">
                  <Field label="Kitchen Layout">
                    <div className="grid grid-cols-3 gap-2">
                      {KITCHEN_LAYOUTS.map(l => (
                        <button
                          key={l.type}
                          type="button"
                          onClick={() => set('kitchenLayout', l.type)}
                          className={`p-2 rounded-lg border text-xs font-semibold transition-colors text-left ${
                            form.kitchenLayout === l.type
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400'
                          }`}
                        >
                          <div className="font-bold">{l.name}</div>
                          <div className="text-[10px] opacity-75">{l.description}</div>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Wardrobe 1 (Master Bedroom)">
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {WARDROBE_TYPES.map(w => (
                          <button
                            key={w.type}
                            type="button"
                            onClick={() => set('wardrobe1Type', w.type)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors text-center ${
                              form.wardrobe1Type === w.type
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400'
                            }`}
                          >
                            {w.name}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Wardrobe 2 (Bedroom 2)">
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {WARDROBE_TYPES.map(w => (
                          <button
                            key={w.type}
                            type="button"
                            onClick={() => set('wardrobe2Type', w.type)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors text-center ${
                              form.wardrobe2Type === w.type
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400'
                            }`}
                          >
                            {w.name}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </div>
              </section>

              {/* Materials */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Materials</h3>
                <div className="flex flex-wrap gap-2">
                  {MATERIAL_OPTIONS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('materials', toggleArr(form.materials, m))}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        form.materials.includes(m)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </section>

              {/* Features */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURE_OPTIONS.map(f => (
                    <label key={f.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.features.some(x => x.id === f.id)}
                        onChange={() => set('features', form.features.some(x => x.id === f.id)
                          ? form.features.filter(x => x.id !== f.id)
                          : [...form.features, f]
                        )}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-xs text-gray-700">{f.name}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Inclusions */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Inclusions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {INCLUSION_OPTIONS.map((inc, i) => (
                    <label key={i} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-indigo-400 transition-colors">
                      <input
                        type="checkbox"
                        checked={form.inclusions.some(x => x.item === inc.item)}
                        onChange={() => set('inclusions', form.inclusions.some(x => x.item === inc.item)
                          ? form.inclusions.filter(x => x.item !== inc.item)
                          : [...form.inclusions, inc]
                        )}
                        className="rounded text-indigo-600"
                      />
                      <span className="text-xs text-gray-700">{inc.item}</span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Variants */}
              <section>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900">Variants</h3>
                  <button
                    type="button"
                    onClick={() => set('hasVariants', !form.hasVariants)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      form.hasVariants ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {form.hasVariants ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {form.hasVariants ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {form.hasVariants && (
                  <div className="space-y-3">
                    {form.variants.map((v, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-600">Variant {i + 1}</span>
                          <button
                            type="button"
                            onClick={() => set('variants', form.variants.filter((_, j) => j !== i))}
                            className="text-red-400 hover:text-red-600"
                          ><X className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Label">
                            <input className={inp} value={v.label || ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], label: e.target.value }; set('variants', nv);
                            }} placeholder="e.g. Premium" />
                          </Field>
                          <Field label="Kitchen Layout">
                            <select className={inp} value={v.kitchenLayout || ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], kitchenLayout: e.target.value }; set('variants', nv);
                            }}>
                              <option value="">Select</option>
                              {KITCHEN_LAYOUTS.map(l => <option key={l.type} value={l.type}>{l.name}</option>)}
                            </select>
                          </Field>
                          <Field label="Wardrobe 1 Type">
                            <select className={inp} value={v.wardrobe1Type || ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], wardrobe1Type: e.target.value }; set('variants', nv);
                            }}>
                              <option value="">Select</option>
                              {WARDROBE_TYPES.map(w => <option key={w.type} value={w.type}>{w.name}</option>)}
                            </select>
                          </Field>
                          <Field label="Wardrobe 2 Type">
                            <select className={inp} value={v.wardrobe2Type || ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], wardrobe2Type: e.target.value }; set('variants', nv);
                            }}>
                              <option value="">Select</option>
                              {WARDROBE_TYPES.map(w => <option key={w.type} value={w.type}>{w.name}</option>)}
                            </select>
                          </Field>
                          <Field label="SKU">
                            <input className={inp} value={v.sku || ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], sku: e.target.value }; set('variants', nv);
                            }} placeholder="SKU-001" />
                          </Field>
                          <Field label="Stock">
                            <input type="number" className={inp} value={v.stock ?? ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], stock: e.target.value }; set('variants', nv);
                            }} placeholder="0" />
                          </Field>
                          <Field label="Price">
                            <input type="number" className={inp} value={v.price ?? ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], price: e.target.value }; set('variants', nv);
                            }} placeholder="0" />
                          </Field>
                          <Field label="MRP">
                            <input type="number" className={inp} value={v.mrp ?? ''} onChange={e => {
                              const nv = [...form.variants]; nv[i] = { ...nv[i], mrp: e.target.value }; set('variants', nv);
                            }} placeholder="0" />
                          </Field>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => set('variants', [...form.variants, { label: '', kitchenLayout: '', wardrobe1Type: '', wardrobe2Type: '', sku: '', price: '', mrp: '', stock: '', isActive: true }])}
                      className="w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 text-xs font-semibold rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Variant
                    </button>
                  </div>
                )}
              </section>

              {/* Package Specs */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Package Specifications</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Suitable For</p>
                    <TagToggle
                      values={SUITABLE_FOR}
                      selected={form.packageMetadata.suitableFor || []}
                      onToggle={v => setPM('suitableFor', toggleArr(form.packageMetadata.suitableFor || [], v))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Style</p>
                    <TagToggle
                      values={STYLE_OPTIONS}
                      selected={form.packageMetadata.style || []}
                      onToggle={v => setPM('style', toggleArr(form.packageMetadata.style || [], v))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Color Scheme</p>
                    <TagToggle
                      values={COLOR_OPTIONS}
                      selected={form.packageMetadata.colorScheme || []}
                      onToggle={v => setPM('colorScheme', toggleArr(form.packageMetadata.colorScheme || [], v))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Delivery Time">
                      <input className={inp} value={form.packageMetadata.deliveryTime || ''} onChange={e => setPM('deliveryTime', e.target.value)} placeholder="e.g. 30-35 days" />
                    </Field>
                    <Field label="Warranty">
                      <input className={inp} value={form.packageMetadata.warranty || ''} onChange={e => setPM('warranty', e.target.value)} placeholder="e.g. 2 years" />
                    </Field>
                    <Field label="Min Area (sq ft)">
                      <input type="number" className={inp} value={form.packageMetadata.area?.min || ''} onChange={e => setPM('area', { ...form.packageMetadata.area, min: e.target.value })} placeholder="600" />
                    </Field>
                    <Field label="Max Area (sq ft)">
                      <input type="number" className={inp} value={form.packageMetadata.area?.max || ''} onChange={e => setPM('area', { ...form.packageMetadata.area, max: e.target.value })} placeholder="900" />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Form actions */}
              <div className="flex gap-3 pt-2 pb-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                    : (editing ? 'Update Package' : 'Create Package')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Modal */}
      {viewItem && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '36rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">{viewItem.name}</h3>
              <button onClick={() => setViewItem(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Images */}
              {viewItem.mainImages?.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {viewItem.mainImages.map((img, i) => (
                    <img key={i} src={img} alt="" className="h-32 w-40 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-indigo-600 font-medium">Base Price</p>
                  <p className="text-lg font-bold text-indigo-900">₹{(viewItem.basePrice || 0).toLocaleString()}</p>
                </div>
                {viewItem.mrp > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 font-medium">MRP</p>
                    <p className="text-lg font-bold text-gray-700">₹{viewItem.mrp.toLocaleString()}</p>
                  </div>
                )}
                {viewItem.discount > 0 && (
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 font-medium">Discount</p>
                    <p className="text-lg font-bold text-green-700">{viewItem.discount}%</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {viewItem.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-gray-700">{viewItem.description}</p>
                </div>
              )}

              {/* Config */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Kitchen</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{viewItem.kitchenLayout || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Wardrobe 1</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{viewItem.wardrobe1Type || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-medium mb-1">Wardrobe 2</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{viewItem.wardrobe2Type || '—'}</p>
                </div>
              </div>

              {/* Materials */}
              {viewItem.materials?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Materials</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.materials.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {viewItem.features?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.features.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{f.name || f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions */}
              {viewItem.inclusions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Inclusions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.inclusions.map((inc, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{inc.item || inc}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {viewItem.hasVariants && viewItem.variants?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Variants</p>
                  <div className="space-y-2">
                    {viewItem.variants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-xs">
                        <span className="font-semibold text-gray-800">{v.label || `Variant ${i + 1}`}</span>
                        <div className="flex items-center gap-3 text-gray-600">
                          {v.kitchenLayout && <span className="capitalize">{v.kitchenLayout}</span>}
                          {v.wardrobe1Type && <span>{v.wardrobe1Type} / {v.wardrobe2Type}</span>}
                          {v.price > 0 && <span className="font-semibold text-gray-900">₹{Number(v.price).toLocaleString()}</span>}
                          {v.stock != null && <span>Qty: {v.stock}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Package Metadata */}
              {(viewItem.packageMetadata?.suitableFor?.length > 0 || viewItem.packageMetadata?.deliveryTime) && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Package Details</p>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    {viewItem.packageMetadata?.deliveryTime && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 mb-0.5">Delivery</p>
                        <p className="font-semibold text-gray-900">{viewItem.packageMetadata.deliveryTime}</p>
                      </div>
                    )}
                    {viewItem.packageMetadata?.warranty && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-gray-500 mb-0.5">Warranty</p>
                        <p className="font-semibold text-gray-900">{viewItem.packageMetadata.warranty}</p>
                      </div>
                    )}
                  </div>
                  {viewItem.packageMetadata?.suitableFor?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {viewItem.packageMetadata.suitableFor.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {viewItem.tags?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewItem.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => setViewItem(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
