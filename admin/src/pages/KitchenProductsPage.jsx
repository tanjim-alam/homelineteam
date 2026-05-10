import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit, Trash2, ChefHat, X, Package, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

const LAYOUT_OPTIONS = [
  { type: 'straight', name: 'Straight', description: 'Single-wall design' },
  { type: 'l-shape',  name: 'L-Shape',  description: 'Corner design' },
  { type: 'parallel', name: 'Parallel', description: 'Two-wall design' },
];

const MATERIAL_OPTIONS = [
  { category: 'cabinets',   material: 'Plywood',           quality: 'good' },
  { category: 'cabinets',   material: 'MDF',               quality: 'basic' },
  { category: 'cabinets',   material: 'Particle Board',    quality: 'basic' },
  { category: 'countertop', material: 'Granite',           quality: 'premium' },
  { category: 'countertop', material: 'Quartz',            quality: 'best' },
  { category: 'countertop', material: 'Marble',            quality: 'premium' },
  { category: 'countertop', material: 'Laminate',          quality: 'good' },
  { category: 'backsplash', material: 'Tiles',             quality: 'good' },
  { category: 'backsplash', material: 'Glass',             quality: 'better' },
  { category: 'flooring',   material: 'Ceramic Tiles',     quality: 'good' },
  { category: 'flooring',   material: 'Vitrified Tiles',   quality: 'better' },
  { category: 'hardware',   material: 'Soft Close Hinges', quality: 'better' },
  { category: 'hardware',   material: 'Standard Hinges',   quality: 'basic' },
];

const APPLIANCE_OPTIONS = [
  { id: 'hob',          name: 'Gas Hob',       category: 'cooking',     essential: true },
  { id: 'chimney',      name: 'Chimney',        category: 'ventilation', essential: true },
  { id: 'sink',         name: 'Kitchen Sink',   category: 'utility',     essential: true },
  { id: 'faucet',       name: 'Faucet',         category: 'utility',     essential: true },
  { id: 'refrigerator', name: 'Refrigerator',   category: 'storage',     essential: false },
  { id: 'microwave',    name: 'Microwave',       category: 'cooking',     essential: false },
  { id: 'dishwasher',   name: 'Dishwasher',      category: 'cleaning',    essential: false },
];

const FEATURE_OPTIONS = [
  { id: 'led-lighting',      name: 'LED Lighting',         category: 'lighting' },
  { id: 'soft-close',        name: 'Soft Close Drawers',   category: 'hardware' },
  { id: 'pull-out',          name: 'Pull-out Storage',     category: 'storage' },
  { id: 'corner-solution',   name: 'Corner Solutions',     category: 'storage' },
  { id: 'tall-unit',         name: 'Tall Storage Unit',    category: 'storage' },
  { id: 'breakfast-counter', name: 'Breakfast Counter',    category: 'convenience' },
];

const STYLE_OPTIONS    = ['modern', 'traditional', 'contemporary', 'minimalist', 'industrial', 'scandinavian'];
const COLOR_OPTIONS    = ['white', 'wood', 'grey', 'colorful', 'black', 'neutral'];
const SUITABLE_FOR     = ['1bhk', '2bhk', '3bhk', '4bhk', 'villa', 'studio'];

const EMPTY_FORM = {
  name: '', slug: '', description: '', basePrice: '', mrp: '', discount: '',
  mainImages: [], imagePreviews: [],
  category: 'modular-kitchen',
  defaultLayout: null,
  defaultMaterials: [], defaultAppliances: [], defaultFeatures: [],
  availableLayouts: [], availableMaterials: [], availableAppliances: [], availableFeatures: [],
  hasVariants: false, variants: [], variantOptions: {}, dynamicFields: {},
  kitchenMetadata: {
    suitableFor: [], style: [], colorScheme: [],
    deliveryTime: '', warranty: '',
    budget: { min: '', max: '' },
    installation: { included: false, cost: '' },
  },
  metaData: { title: '', description: '', keywords: '', ogImage: null },
  tags: '',
};

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function TagToggle({ options, selected, onToggle, upper }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            selected.includes(opt)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
          }`}
        >
          {upper ? opt.toUpperCase() : opt}
        </button>
      ))}
    </div>
  );
}

export default function KitchenProductsPage() {
  const { showToast } = useToast();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/kitchen-products');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      showToast('error', 'Failed to load kitchen products');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setForm(f => ({ ...f, slug }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(f => ({
      ...f,
      mainImages:    files,
      imagePreviews: files.map(file => URL.createObjectURL(file)),
    }));
  };

  const removeImagePreview = (index) => {
    setForm(f => ({
      ...f,
      mainImages:    f.mainImages.filter((_, i) => i !== index),
      imagePreviews: f.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      ...EMPTY_FORM,
      name:        item.name,
      slug:        item.slug,
      description: item.description || '',
      basePrice:   item.basePrice   || '',
      mrp:         item.mrp         || '',
      discount:    item.discount    || '',
      category:    item.category    || 'modular-kitchen',
      defaultLayout:       item.defaultLayout       || null,
      defaultMaterials:    item.defaultMaterials    || [],
      defaultAppliances:   item.defaultAppliances   || [],
      defaultFeatures:     item.defaultFeatures     || [],
      availableLayouts:    item.availableLayouts    || [],
      availableMaterials:  item.availableMaterials  || [],
      availableAppliances: item.availableAppliances || [],
      availableFeatures:   item.availableFeatures   || [],
      hasVariants:    item.hasVariants    || false,
      variants:       item.variants       || [],
      variantOptions: item.variantOptions || {},
      dynamicFields:  item.dynamicFields  || {},
      kitchenMetadata: item.kitchenMetadata || EMPTY_FORM.kitchenMetadata,
      metaData: {
        title:       item.metaData?.title       || '',
        description: item.metaData?.description || '',
        keywords:    Array.isArray(item.metaData?.keywords) ? item.metaData.keywords.join(', ') : (item.metaData?.keywords || ''),
        ogImage:     item.metaData?.ogImage     || null,
      },
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('slug',        form.slug);
      fd.append('description', form.description);
      fd.append('basePrice',   form.basePrice);
      fd.append('mrp',         form.mrp);
      fd.append('discount',    form.discount);
      fd.append('category',    form.category);
      fd.append('defaultLayout',       JSON.stringify(form.defaultLayout));
      fd.append('defaultMaterials',    JSON.stringify(form.defaultMaterials));
      fd.append('defaultAppliances',   JSON.stringify(form.defaultAppliances));
      fd.append('defaultFeatures',     JSON.stringify(form.defaultFeatures));
      fd.append('availableLayouts',    JSON.stringify(form.availableLayouts));
      fd.append('availableMaterials',  JSON.stringify(form.availableMaterials));
      fd.append('availableAppliances', JSON.stringify(form.availableAppliances));
      fd.append('availableFeatures',   JSON.stringify(form.availableFeatures));
      fd.append('hasVariants',     String(form.hasVariants));
      fd.append('variants',        JSON.stringify(form.variants.map(v => ({
        ...v,
        price: Number(v.price) || 0,
        mrp:   Number(v.mrp)   || 0,
        stock: Number(v.stock) || 0,
      }))));
      fd.append('variantOptions',  JSON.stringify(form.variantOptions));
      fd.append('dynamicFields',   JSON.stringify(form.dynamicFields));
      fd.append('kitchenMetadata', JSON.stringify(form.kitchenMetadata));
      fd.append('metaData', JSON.stringify({
        title:       form.metaData.title,
        description: form.metaData.description,
        keywords:    form.metaData.keywords ? form.metaData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
      }));
      fd.append('tags', form.tags);
      form.mainImages.filter(f => f instanceof File).forEach(f => fd.append('images', f));

      if (editing) {
        await apiClient.put(`/kitchen-products/${editing._id}`, fd);
      } else {
        await apiClient.post('/kitchen-products', fd);
      }
      closeForm();
      fetchItems();
      showToast('success', editing ? 'Kitchen product updated' : 'Kitchen product created');
    } catch (e) {
      showToast('error', e?.response?.data?.message || 'Failed to save kitchen product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this kitchen product?')) return;
    try {
      await apiClient.delete(`/kitchen-products/${id}`);
      fetchItems();
      showToast('success', 'Kitchen product deleted');
    } catch {
      showToast('error', 'Failed to delete kitchen product');
    }
  };

  const set   = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setKM = (key, val) => setForm(f => ({ ...f, kitchenMetadata: { ...f.kitchenMetadata, [key]: val } }));
  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kitchen Products</h2>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} products in your catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Kitchen Product
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Kitchen Products</h3>
          </div>
          <span className="text-xs text-gray-400">{items.length} total</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-7 h-7 text-orange-400" />
            </div>
            <p className="text-gray-900 font-semibold mb-1">No kitchen products yet</p>
            <p className="text-gray-400 text-sm mb-5">Add your first kitchen product to get started</p>
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Kitchen Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Layout</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Variants</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.mainImages?.[0]
                            ? <img src={item.mainImages[0]} alt={item.name} className="w-10 h-10 object-cover" />
                            : <div className="w-10 h-10 flex items-center justify-center"><ChefHat className="w-5 h-5 text-gray-400" /></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 leading-snug truncate max-w-[220px]">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700 capitalize">{item.category?.replace(/-/g, ' ')}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">₹{(item.basePrice || 0).toLocaleString('en-IN')}</p>
                      {item.mrp && item.mrp > item.basePrice && (
                        <p className="text-xs text-gray-400 line-through">₹{item.mrp.toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{item.defaultLayout?.name || <span className="text-gray-400">—</span>}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {item.hasVariants
                        ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap"><Package className="w-3 h-3 flex-shrink-0" />{item.variants?.length || 0} variants</span>
                        : <span className="text-xs text-gray-400 whitespace-nowrap">No variants</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewItem(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Slide-in form panel */}
      {showForm && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={closeForm} />
          <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '42rem', height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            {/* Sticky header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <ChefHat className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{editing ? 'Edit Kitchen Product' : 'Add Kitchen Product'}</h2>
                  <p className="text-xs text-gray-400">{editing ? 'Update product details' : 'Create a new kitchen product'}</p>
                </div>
              </div>
              <button onClick={closeForm} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <form id="kitchen-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Basic Info */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Basic Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Product Name *">
                      <input
                        className={inputCls}
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        onBlur={() => form.name && !editing && generateSlug(form.name)}
                        placeholder="e.g. Modern L-Shape Kitchen"
                        required
                      />
                    </Field>
                    <Field label="Slug *">
                      <input
                        className={inputCls}
                        value={form.slug}
                        onChange={e => set('slug', e.target.value)}
                        placeholder="modern-l-shape-kitchen"
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={form.description}
                      onChange={e => set('description', e.target.value)}
                      placeholder="Describe this kitchen product..."
                    />
                  </Field>
                  <Field label="Category">
                    <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                      <option value="modular-kitchen">Modular Kitchen</option>
                      <option value="kitchen-package">Kitchen Package</option>
                      <option value="kitchen-accessories">Kitchen Accessories</option>
                      <option value="kitchen-appliances">Kitchen Appliances</option>
                    </select>
                  </Field>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Base Price (₹) *">
                    <input type="number" className={inputCls} value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="0" required />
                  </Field>
                  <Field label="MRP (₹)">
                    <input type="number" className={inputCls} value={form.mrp} onChange={e => set('mrp', e.target.value)} placeholder="0" />
                  </Field>
                  <Field label="Discount (%)">
                    <input type="number" className={inputCls} value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="0" min="0" max="100" />
                  </Field>
                </div>
              </section>

              {/* Layout */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Default Layout</h3>
                <div className="grid grid-cols-3 gap-3">
                  {LAYOUT_OPTIONS.map(layout => (
                    <button
                      key={layout.type}
                      type="button"
                      onClick={() => set('defaultLayout', form.defaultLayout?.type === layout.type ? null : layout)}
                      className={`p-3 rounded-xl border text-left text-sm transition-colors ${
                        form.defaultLayout?.type === layout.type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold">{layout.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{layout.description}</div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Materials */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Default Materials</h3>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto border border-gray-100 rounded-xl p-3">
                  {MATERIAL_OPTIONS.map((m, i) => {
                    const selected = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                    return (
                      <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1.5">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const exists = form.defaultMaterials.some(x => x.category === m.category && x.material === m.material);
                            set('defaultMaterials', exists
                              ? form.defaultMaterials.filter(x => !(x.category === m.category && x.material === m.material))
                              : [...form.defaultMaterials, m]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">{m.category} · {m.material}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Appliances */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Default Appliances</h3>
                <div className="grid grid-cols-2 gap-2">
                  {APPLIANCE_OPTIONS.map(a => {
                    const selected = form.defaultAppliances.some(x => x.id === a.id);
                    return (
                      <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer border border-gray-100 rounded-lg px-3 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const exists = form.defaultAppliances.some(x => x.id === a.id);
                            set('defaultAppliances', exists
                              ? form.defaultAppliances.filter(x => x.id !== a.id)
                              : [...form.defaultAppliances, a]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">{a.name}{a.essential && <span className="text-orange-500 text-xs font-semibold ml-1">Essential</span>}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Features */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Default Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FEATURE_OPTIONS.map(f => {
                    const selected = form.defaultFeatures.some(x => x.id === f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer border border-gray-100 rounded-lg px-3 py-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            const exists = form.defaultFeatures.some(x => x.id === f.id);
                            set('defaultFeatures', exists
                              ? form.defaultFeatures.filter(x => x.id !== f.id)
                              : [...form.defaultFeatures, f]
                            );
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700">{f.name}</span>
                      </label>
                    );
                  })}
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
                      form.hasVariants ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variant {i + 1}</p>
                          <button
                            type="button"
                            onClick={() => set('variants', form.variants.filter((_, idx) => idx !== i))}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Label *">
                            <input
                              className={inputCls}
                              value={v.label || ''}
                              onChange={e => { const u = [...form.variants]; u[i] = { ...u[i], label: e.target.value }; set('variants', u); }}
                              placeholder="e.g. 6ft Straight"
                            />
                          </Field>
                          <Field label="SKU">
                            <input
                              className={inputCls}
                              value={v.sku || ''}
                              onChange={e => { const u = [...form.variants]; u[i] = { ...u[i], sku: e.target.value }; set('variants', u); }}
                              placeholder="e.g. KIT-S-6FT"
                            />
                          </Field>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Price (₹) *">
                            <input
                              type="number"
                              className={inputCls}
                              value={v.price || ''}
                              onChange={e => { const u = [...form.variants]; u[i] = { ...u[i], price: e.target.value }; set('variants', u); }}
                              placeholder="0"
                            />
                          </Field>
                          <Field label="MRP (₹)">
                            <input
                              type="number"
                              className={inputCls}
                              value={v.mrp || ''}
                              onChange={e => { const u = [...form.variants]; u[i] = { ...u[i], mrp: e.target.value }; set('variants', u); }}
                              placeholder="0"
                            />
                          </Field>
                          <Field label="Stock">
                            <input
                              type="number"
                              className={inputCls}
                              value={v.stock || ''}
                              onChange={e => { const u = [...form.variants]; u[i] = { ...u[i], stock: e.target.value }; set('variants', u); }}
                              placeholder="0"
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => set('variants', [...form.variants, { label: '', sku: '', price: '', mrp: '', stock: '', isActive: true }])}
                      className="w-full py-2.5 border-2 border-dashed border-blue-200 text-blue-600 text-sm font-semibold rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </button>
                  </div>
                )}
              </section>

              {/* Kitchen Specs */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Kitchen Specifications</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suitable For</p>
                    <TagToggle
                      options={SUITABLE_FOR}
                      selected={form.kitchenMetadata.suitableFor}
                      onToggle={opt => setKM('suitableFor', toggleArr(form.kitchenMetadata.suitableFor, opt))}
                      upper
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Style</p>
                    <TagToggle
                      options={STYLE_OPTIONS}
                      selected={form.kitchenMetadata.style}
                      onToggle={opt => setKM('style', toggleArr(form.kitchenMetadata.style, opt))}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color Scheme</p>
                    <TagToggle
                      options={COLOR_OPTIONS}
                      selected={form.kitchenMetadata.colorScheme}
                      onToggle={opt => setKM('colorScheme', toggleArr(form.kitchenMetadata.colorScheme, opt))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Delivery Time">
                      <input className={inputCls} value={form.kitchenMetadata.deliveryTime} onChange={e => setKM('deliveryTime', e.target.value)} placeholder="e.g. 15-20 days" />
                    </Field>
                    <Field label="Warranty">
                      <input className={inputCls} value={form.kitchenMetadata.warranty} onChange={e => setKM('warranty', e.target.value)} placeholder="e.g. 2 years" />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Tags */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Tags</h3>
                <Field label="Tags (comma separated)">
                  <input className={inputCls} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="modular, modern, premium" />
                </Field>
              </section>

              {/* Images */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">Product Images</h3>
                <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
                  <input
                    key={editing?._id ?? 'new'}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="text-sm text-gray-500">
                    {editing ? 'Click to replace images (optional)' : 'Click to upload product images'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Up to 10 images, max 5MB each</div>
                </label>

                {form.imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {form.imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {editing?.mainImages?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Current images:</p>
                    <div className="flex flex-wrap gap-2">
                      {editing.mainImages.map((src, i) => (
                        <img key={i} src={src} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200 opacity-70" />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </form>

            {/* Sticky footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="kitchen-form"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* View product modal */}
      {viewItem && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setViewItem(null)}
        >
          <div
            style={{ position: 'relative', width: '100%', maxWidth: '48rem', maxHeight: '90vh', backgroundColor: 'white', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-4 h-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate max-w-xs">{viewItem.name}</h2>
                  <p className="text-xs text-gray-400 capitalize">{viewItem.category?.replace(/-/g, ' ')}</p>
                </div>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Images */}
              {viewItem.mainImages?.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {viewItem.mainImages.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-28 h-28 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                  ))}
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">Base Price</p>
                  <p className="text-lg font-bold text-green-700">₹{(viewItem.basePrice || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">MRP</p>
                  <p className="text-lg font-bold text-gray-700">₹{(viewItem.mrp || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Discount</p>
                  <p className="text-lg font-bold text-orange-700">{viewItem.discount || 0}%</p>
                </div>
              </div>

              {/* Description */}
              {viewItem.description && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewItem.description}</p>
                </div>
              )}

              {/* Layout + counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Default Layout</p>
                  <p className="text-sm font-semibold text-gray-900">{viewItem.defaultLayout?.name || '—'}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Materials · Appliances · Features</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {viewItem.defaultMaterials?.length || 0} · {viewItem.defaultAppliances?.length || 0} · {viewItem.defaultFeatures?.length || 0}
                  </p>
                </div>
              </div>

              {/* Variants */}
              {viewItem.hasVariants && viewItem.variants?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Variants ({viewItem.variants.length})</p>
                  <div className="space-y-2">
                    {viewItem.variants.map((v, i) => (
                      <div key={i} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{v.label || v.fields?.label || `Variant ${i + 1}`}</p>
                          {v.sku && <p className="text-xs text-gray-400">SKU: {v.sku}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">₹{(v.price || 0).toLocaleString('en-IN')}</p>
                          {v.stock !== undefined && <p className="text-xs text-gray-400">Stock: {v.stock}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kitchen specs */}
              {viewItem.kitchenMetadata && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Kitchen Specifications</p>
                  <div className="grid grid-cols-2 gap-3">
                    {viewItem.kitchenMetadata.suitableFor?.length > 0 && (
                      <div className="border border-gray-100 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1.5">Suitable For</p>
                        <div className="flex flex-wrap gap-1">
                          {viewItem.kitchenMetadata.suitableFor.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{s.toUpperCase()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewItem.kitchenMetadata.style?.length > 0 && (
                      <div className="border border-gray-100 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1.5">Style</p>
                        <div className="flex flex-wrap gap-1">
                          {viewItem.kitchenMetadata.style.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full capitalize">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewItem.kitchenMetadata.deliveryTime && (
                      <div className="border border-gray-100 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">Delivery Time</p>
                        <p className="text-sm font-semibold text-gray-900">{viewItem.kitchenMetadata.deliveryTime}</p>
                      </div>
                    )}
                    {viewItem.kitchenMetadata.warranty && (
                      <div className="border border-gray-100 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-0.5">Warranty</p>
                        <p className="text-sm font-semibold text-gray-900">{viewItem.kitchenMetadata.warranty}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewItem.tags?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(viewItem.tags) ? viewItem.tags : [viewItem.tags]).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <span className="text-xs text-gray-400 font-mono">ID: {viewItem._id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setViewItem(null); openEdit(viewItem); }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => setViewItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
