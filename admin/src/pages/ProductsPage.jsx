import { useState, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, Package, Image as ImageIcon,
  GripVertical, ChevronDown, AlertCircle, CheckCircle,
  X, Tag, Settings, IndianRupee, Search, Layers,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';
import RichTextEditor from '../components/RichTextEditor';

/* ─── tiny helpers ──────────────────────────────────────────────────── */
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

const SectionLabel = ({ children }) => (
  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</p>
);

const Input = ({ label, hint, prefix, suffix, required: req, ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-gray-700">
        {label} {req && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {prefix && (
        <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm font-medium pointer-events-none">{prefix}</span>
      )}
      <input
        className={`w-full border border-gray-200 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all placeholder:text-gray-400
          ${prefix ? 'pl-8' : 'pl-4'} ${suffix ? 'pr-10' : 'pr-4'}`}
        required={req}
        {...props}
      />
      {suffix && (
        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm font-medium pointer-events-none">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
export default function ProductsPage() {
  const [products, setProducts]             = useState([]);
  const [categories, setCategories]         = useState([]);
  const [subcategories, setSubcategories]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showForm, setShowForm]             = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [createLoading, setCreateLoading]   = useState(false);
  const [updateLoading, setUpdateLoading]   = useState(false);
  const [creating, setCreating]             = useState(false);
  const { showToast }                        = useToast();
  const [searchQuery, setSearchQuery]       = useState('');

  const [form, setForm] = useState({
    subcategoryId: '', name: '', slug: '', basePrice: '', mrp: '', discount: '',
    description: '', mainImages: [], imagePreviews: [], hasVariants: false,
    variants: [], variantOptions: {}, dynamicFields: {},
    customSize: { enabled: false, sizeUnit: 'mm', widthBasePrice: '', heightBasePrice: '', minWidth: '', maxWidth: '', minHeight: '', maxHeight: '' },
    metaData: { title: '', description: '', keywords: '', ogImage: null }
  });

  const [selectedCategory, setSelectedCategory]           = useState(null);
  const [selectedCategoryFieldSlugs, setSelectedCategoryFieldSlugs] = useState({});
  const [existingImages, setExistingImages]               = useState([]);
  const [selectedProducts, setSelectedProducts]           = useState([]);
  const [draggedIndex, setDraggedIndex]                   = useState(null);
  const [draggedCombinedIndex, setDraggedCombinedIndex]   = useState(null);
  const [, setForceRender]                                = useState(0);

  const [variantForm, setVariantForm]           = useState({ fields: {}, price: '', mrp: '', discount: '', stock: 0, images: [] });
  const [bulkVariantSettings, setBulkVariantSettings] = useState({ price: '', mrp: '', stock: '' });
  const [variantOptionsForm, setVariantOptionsForm]   = useState({ fieldSlug: '', options: [''] });


  /* ── fetch ──────────────────────────────────────────────────────── */
  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products');
      const data = res?.data ?? res;
      if (Array.isArray(data)) setProducts(data);
      else if (Array.isArray(data?.products)) setProducts(data.products);
      else if (Array.isArray(data?.items)) setProducts(data.items);
      else setProducts([]);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : (Array.isArray(data?.categories) ? data.categories : []);
      setCategories(list);
      setSubcategories(list);
    } catch { setCategories([]); setSubcategories([]); }
  };

  const fetchCategoryDetails = async (categoryId, dynamicFields = {}) => {
    try {
      const res = await apiClient.get(`/categories/id/${categoryId}`);
      const data = res?.data ?? res;
      setSelectedCategory(data);
      const selected = {};
      (data?.customFields || []).forEach(f => { selected[f.slug] = true; });
      setSelectedCategoryFieldSlugs(selected);
    } catch { setSelectedCategory(null); setSelectedCategoryFieldSlugs({}); }
  };

  const handleSubcategoryChange = (id) => {
    setForm(f => ({ ...f, subcategoryId: id, dynamicFields: {} }));
    if (id) fetchCategoryDetails(id);
    else { setSelectedCategory(null); setSelectedCategoryFieldSlugs({}); }
  };

  /* ── image handlers ─────────────────────────────────────────────── */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const previews = files.map(f => URL.createObjectURL(f));
    setForm(prev => ({ ...prev, mainImages: [...prev.mainImages, ...files], imagePreviews: [...prev.imagePreviews, ...previews] }));
    e.target.value = '';
  };

  const removeImageFromCombined = (index) => {
    if (index < existingImages.length) {
      setExistingImages(imgs => imgs.filter((_, i) => i !== index));
    } else {
      const ni = index - existingImages.length;
      setForm(prev => ({
        ...prev,
        mainImages: prev.mainImages.filter((_, i) => i !== ni),
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== ni),
      }));
    }
  };

  const handleCombinedDragStart = (e, index) => { setDraggedCombinedIndex(index); e.dataTransfer.effectAllowed = 'move'; };
  const handleCombinedDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleCombinedDragEnd   = () => setDraggedCombinedIndex(null);

  const handleCombinedDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedCombinedIndex === null || draggedCombinedIndex === dropIndex) { setDraggedCombinedIndex(null); return; }
    const combined = [
      ...existingImages.map((img, i) => ({ img, isExisting: true, file: null, i })),
      ...form.imagePreviews.map((img, i) => ({ img, isExisting: false, file: form.mainImages[i], i })),
    ];
    const dragged = combined.splice(draggedCombinedIndex, 1)[0];
    combined.splice(dropIndex, 0, dragged);
    const newExisting = [], newPreviews = [], newFiles = [];
    combined.forEach(item => {
      if (item.isExisting) newExisting.push(item.img);
      else { newPreviews.push(item.img); if (item.file) newFiles.push(item.file); }
    });
    setExistingImages([...newExisting]);
    setForm(prev => ({ ...prev, mainImages: [...newFiles], imagePreviews: [...newPreviews] }));
    setForceRender(n => n + 1);
    setDraggedCombinedIndex(null);
  };

  /* ── dynamic fields ─────────────────────────────────────────────── */
  const updateDynamicField = (slug, value) =>
    setForm(prev => ({ ...prev, dynamicFields: { ...prev.dynamicFields, [slug]: value } }));

  const toggleCategoryField = (slug, enabled, isRequired = false) => {
    if (isRequired && !enabled) return;
    setSelectedCategoryFieldSlugs(prev => ({ ...prev, [slug]: enabled }));
    setForm(prev => ({
      ...prev,
      dynamicFields: enabled
        ? prev.dynamicFields
        : Object.fromEntries(Object.entries(prev.dynamicFields).filter(([k]) => k !== slug))
    }));
  };

  const renderDynamicField = (field) => {
    const base = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
    switch (field.type) {
      case 'number':
        return <input type="number" value={form.dynamicFields[field.slug] || ''} onChange={e => updateDynamicField(field.slug, e.target.value)} className={base} placeholder={field.name} required={field.required} />;
      case 'dropdown':
        return (
          <select value={form.dynamicFields[field.slug] || ''} onChange={e => updateDynamicField(field.slug, e.target.value)} className={base} required={field.required}>
            <option value="">Select {field.name}</option>
            {(field.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        );
      case 'multi-select':
        return (
          <select multiple value={form.dynamicFields[field.slug] || []}
            onChange={e => updateDynamicField(field.slug, Array.from(e.target.selectedOptions, o => o.value))}
            className={base} required={field.required}>
            {(field.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        );
      case 'boolean':
        return <input type="checkbox" checked={form.dynamicFields[field.slug] || false} onChange={e => updateDynamicField(field.slug, e.target.checked)} className="w-5 h-5 rounded accent-blue-600" />;
      case 'image':
        return <input type="file" accept="image/*" onChange={e => { if (e.target.files[0]) updateDynamicField(field.slug, e.target.files[0]); }} className={base} />;
      default:
        return <input type="text" value={form.dynamicFields[field.slug] || ''} onChange={e => updateDynamicField(field.slug, e.target.value)} className={base} placeholder={field.name} required={field.required} />;
    }
  };

  /* ── variant options ────────────────────────────────────────────── */
  const updateVariantOptions = (slug, opts) => setForm(prev => ({ ...prev, variantOptions: { ...prev.variantOptions, [slug]: opts } }));
  const updateVariantField   = (slug, value) => setVariantForm(prev => ({ ...prev, fields: { ...prev.fields, [slug]: value } }));

  const saveVariantOptions = () => {
    const valid = variantOptionsForm.options.filter(o => o.trim());
    if (variantOptionsForm.fieldSlug && valid.length) {
      updateVariantOptions(variantOptionsForm.fieldSlug, valid);
      setVariantOptionsForm({ fieldSlug: '', options: [''] });
    }
  };

  const removeVariant = (index) => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  /* ── form reset / edit ──────────────────────────────────────────── */
  const resetForm = () => {
    setForm({ subcategoryId: '', name: '', slug: '', basePrice: '', mrp: '', discount: '', description: '', mainImages: [], imagePreviews: [], hasVariants: false, variants: [], variantOptions: {}, dynamicFields: {}, customSize: { enabled: false, sizeUnit: 'mm', widthBasePrice: '', heightBasePrice: '', minWidth: '', maxWidth: '', minHeight: '', maxHeight: '' }, metaData: { title: '', description: '', keywords: '', ogImage: null } });
    setEditingProduct(null); setSelectedCategory(null); setExistingImages([]);
    setVariantForm({ fields: {}, price: '', mrp: '', discount: '', stock: 0, images: [] });
    setVariantOptionsForm({ fieldSlug: '', options: [''] });
  };

  const openCreate = () => { resetForm(); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      subcategoryId: product.categoryId || product.subcategoryId || '',
      name: product.name, slug: product.slug,
      basePrice: product.basePrice || product.price || '', mrp: product.mrp || '', discount: product.discount || '',
      description: product.description || '', mainImages: [], imagePreviews: [],
      hasVariants: product.hasVariants || false, variants: product.variants || [],
      variantOptions: product.variantOptions || {}, dynamicFields: product.dynamicFields || {},
      customSize: { enabled: product.customSize?.enabled || false, sizeUnit: product.customSize?.sizeUnit || 'mm', widthBasePrice: product.customSize?.widthBasePrice ?? '', heightBasePrice: product.customSize?.heightBasePrice ?? '', minWidth: product.customSize?.minWidth ?? '', maxWidth: product.customSize?.maxWidth ?? '', minHeight: product.customSize?.minHeight ?? '', maxHeight: product.customSize?.maxHeight ?? '' },
      metaData: { title: product.metaData?.title || '', description: product.metaData?.description || '', keywords: Array.isArray(product.metaData?.keywords) ? product.metaData.keywords.join(', ') : (product.metaData?.keywords || ''), ogImage: product.metaData?.ogImage || null }
    });
    setExistingImages(product.mainImages || []);
    if (product.categoryId || product.subcategoryId) fetchCategoryDetails(product.categoryId || product.subcategoryId, product.dynamicFields || {});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.basePrice && parseFloat(form.basePrice) <= 0) { showToast('error', 'Base price must be greater than 0'); return; }
    if (form.mrp && parseFloat(form.mrp) < parseFloat(form.basePrice)) { showToast('error', 'MRP cannot be less than base price'); return; }
    if (!editingProduct && (!form.mainImages || form.mainImages.length === 0)) { showToast('error', 'Please upload at least one product image'); return; }

    try {
      setCreating(true);
      const fd = new FormData();
      fd.append('categoryId', form.subcategoryId);
      fd.append('name', form.name); fd.append('slug', form.slug);
      fd.append('basePrice', form.basePrice); fd.append('mrp', form.mrp); fd.append('discount', form.discount);
      fd.append('description', form.description);
      fd.append('hasVariants', form.hasVariants);
      fd.append('variants', JSON.stringify(form.variants));
      fd.append('variantOptions', JSON.stringify(form.variantOptions));
      fd.append('dynamicFields', JSON.stringify(form.dynamicFields));
      fd.append('customSize', JSON.stringify(form.customSize));
      fd.append('metaData[title]', form.metaData.title || '');
      fd.append('metaData[description]', form.metaData.description || '');
      fd.append('metaData[keywords]', form.metaData.keywords || '');

      if (editingProduct) {
        const allImages = [...existingImages, ...form.imagePreviews];
        allImages.forEach((img, i) => {
          if (i < existingImages.length) fd.append('orderedImages', img);
          else { const fi = i - existingImages.length; if (fi < form.mainImages.length) fd.append('orderedImages', form.mainImages[fi]); }
        });
        fd.append('updateImageOrder', 'true');
        setUpdateLoading(true);
        await apiClient.put(`/products/${editingProduct._id}`, fd);
        showToast('success', 'Product updated successfully!');
        await fetchProducts();
        setTimeout(() => { setShowForm(false); resetForm(); }, 1500);
      } else {
        setCreateLoading(true);
        (form.mainImages || []).forEach(img => fd.append('images', img));
        await apiClient.post('/products', fd);
        showToast('success', 'Product created successfully!');
        await fetchProducts();
        setTimeout(() => { setShowForm(false); resetForm(); }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      showToast('error', msg || 'Failed to save product');
    } finally { setCreateLoading(false); setUpdateLoading(false); setCreating(false); }
  };

  /* ── delete / bulk ──────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await apiClient.delete(`/products/${id}`); fetchProducts(); }
    catch { showToast('error', 'Failed to delete product'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length || !confirm(`Delete ${selectedProducts.length} product(s)?`)) return;
    try {
      await Promise.all(selectedProducts.map(id => apiClient.delete(`/products/${id}`)));
      setSelectedProducts([]); fetchProducts();
    } catch { showToast('error', 'Failed to delete some products'); }
  };

  const handleSelectAll = (checked) => setSelectedProducts(checked ? products.map(p => p._id) : []);
  const handleProductSelect = (id, checked) =>
    setSelectedProducts(prev => checked ? [...prev, id] : prev.filter(x => x !== id));

  /* ── bulk variant generation ────────────────────────────────────── */
  const generateAllVariants = () => {
    if (!selectedCategory?.variantFields || !Object.keys(form.variantOptions).length) return;
    const fields = selectedCategory.variantFields;
    const optionArrays = fields.map(f => form.variantOptions[f.slug] || []).filter(o => o.length);
    if (!optionArrays.length) return;
    const combos = optionArrays.reduce((acc, opts) =>
      acc.flatMap(combo => opts.map(opt => [...combo, opt])), [[]]);
    const variants = combos.map(combo => {
      const varFields = {};
      fields.forEach((f, i) => { if (combo[i] !== undefined) varFields[f.slug] = combo[i]; });
      return { fields: varFields, price: bulkVariantSettings.price || form.basePrice, mrp: bulkVariantSettings.mrp || form.mrp, discount: '', stock: parseInt(bulkVariantSettings.stock) || 0, images: [] };
    });
    setForm(prev => ({ ...prev, variants }));
    setVariantForm({ fields: {}, price: '', mrp: '', discount: '', stock: 0, images: [] });
    setBulkVariantSettings({ price: '', mrp: '', stock: '' });
  };

  /* ── filtered products ──────────────────────────────────────────── */
  const filteredProducts = products.filter(p =>
    !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.slug?.includes(searchQuery.toLowerCase())
  );

  const combinedImages = [
    ...existingImages.map((img, i) => ({ url: img, isExisting: true, idx: i })),
    ...form.imagePreviews.map((img, i) => ({ url: img, isExisting: false, idx: i + existingImages.length })),
  ];

  /* ══════════════════════════════ RENDER ═════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ── PRODUCT FORM ──────────────────────────────────────────── */}
      {showForm ? (
        <div className="space-y-6">
          {/* Form header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <p className="text-xs text-gray-400">{editingProduct ? `Editing: ${editingProduct.name}` : 'Fill in the details to create a product'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="product-form" disabled={creating || createLoading || updateLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-colors">
                {(creating || createLoading || updateLoading) && (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>

          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* ── Section 1: Basic Info ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <SectionLabel>Basic Information</SectionLabel>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">Category <span className="text-red-500">*</span></label>
                <select value={form.subcategoryId} onChange={e => handleSubcategoryChange(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                  <option value="">Choose a category</option>
                  {subcategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Product Name" required value={form.name} placeholder="e.g., Premium Curtain Set"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onBlur={() => !editingProduct && setForm(f => ({ ...f, slug: slugify(f.name) }))} />
                <Input label="URL Slug" required value={form.slug} placeholder="premium-curtain-set"
                  hint="Auto-generated from name"
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>

            {/* ── Section 2: Pricing ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <SectionLabel>Pricing</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Selling Price" required type="number" min="0" prefix="₹"
                  value={form.basePrice} placeholder="0"
                  onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                  hint="Price customers pay" />
                <Input label="MRP" type="number" min="0" prefix="₹"
                  value={form.mrp} placeholder="0"
                  onChange={e => setForm(f => ({ ...f, mrp: e.target.value }))}
                  hint="Original price before discount" />
                <Input label="Discount" type="number" min="0" max="100" suffix="%"
                  value={form.discount} placeholder="0"
                  onChange={e => setForm(f => ({ ...f, discount: e.target.value }))}
                  hint="Percentage off MRP" />
              </div>
              {form.basePrice && form.mrp && parseFloat(form.mrp) > parseFloat(form.basePrice) && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Customers save <strong>₹{(parseFloat(form.mrp) - parseFloat(form.basePrice)).toFixed(0)}</strong> ({(((parseFloat(form.mrp) - parseFloat(form.basePrice)) / parseFloat(form.mrp)) * 100).toFixed(1)}% off)
                </div>
              )}
            </div>

            {/* ── Section 3: Description ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <SectionLabel>Description</SectionLabel>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <RichTextEditor value={form.description}
                  onChange={v => setForm(f => ({ ...f, description: v }))}
                  placeholder="Describe your product..." />
              </div>
            </div>

            {/* ── Section 4: Images ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <SectionLabel>Product Images</SectionLabel>
                <span className="text-xs text-gray-400">{combinedImages.length} image{combinedImages.length !== 1 ? 's' : ''} · Drag to reorder</span>
              </div>

              {combinedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {combinedImages.map((item, idx) => (
                    <div key={idx}
                      draggable
                      onDragStart={e => handleCombinedDragStart(e, idx)}
                      onDragOver={handleCombinedDragOver}
                      onDrop={e => handleCombinedDrop(e, idx)}
                      onDragEnd={handleCombinedDragEnd}
                      className={`relative group aspect-square rounded-xl overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all
                        ${draggedCombinedIndex === idx ? 'opacity-50 border-blue-400' : 'border-gray-100 hover:border-gray-300'}`}>
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">Main</div>
                      )}
                      <button type="button" onClick={() => removeImageFromCombined(item.idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl p-8 cursor-pointer hover:bg-blue-50/30 transition-all">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Click to upload images</p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP · Multiple files allowed</p>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            {/* ── Section 5: Custom Fields ── */}
            {selectedCategory?.customFields?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <SectionLabel>Product Details — {selectedCategory.name}</SectionLabel>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCategory.customFields.map((field) => (
                    selectedCategoryFieldSlugs[field.slug] && (
                      <div key={field.slug} className="space-y-1.5">
                        <label className="block text-sm font-semibold text-gray-700">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                          <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{field.type}</span>
                        </label>
                        {renderDynamicField(field)}
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* ── Section 6: Custom Size ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <SectionLabel>Custom Size Configuration</SectionLabel>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.customSize.enabled}
                  onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, enabled: e.target.checked } }))}
                  className="w-5 h-5 rounded accent-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Enable custom width × height sizing</span>
              </label>

              {form.customSize.enabled && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700">Size Unit</label>
                      <select value={form.customSize.sizeUnit}
                        onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, sizeUnit: e.target.value } }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="mm">mm</option>
                        <option value="cm">cm</option>
                        <option value="ft">ft</option>
                      </select>
                    </div>
                    <Input label="Width Price / unit" type="number" min="0" prefix="₹"
                      value={form.customSize.widthBasePrice} placeholder="0"
                      onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, widthBasePrice: e.target.value } }))} />
                    <Input label="Height Price / unit" type="number" min="0" prefix="₹"
                      value={form.customSize.heightBasePrice} placeholder="0"
                      onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, heightBasePrice: e.target.value } }))} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input label="Min Width" type="number" min="0" value={form.customSize.minWidth} placeholder="0"
                      onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, minWidth: e.target.value } }))} />
                    <Input label="Max Width" type="number" min="0" value={form.customSize.maxWidth} placeholder="0"
                      onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, maxWidth: e.target.value } }))} />
                    <Input label="Min Height" type="number" min="0" value={form.customSize.minHeight} placeholder="0"
                      onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, minHeight: e.target.value } }))} />
                    <Input label="Max Height" type="number" min="0" value={form.customSize.maxHeight} placeholder="0"
                      onChange={e => setForm(f => ({ ...f, customSize: { ...f.customSize, maxHeight: e.target.value } }))} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 7: Variants ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Settings className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <SectionLabel>Variants</SectionLabel>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.hasVariants}
                  onChange={e => setForm(f => ({ ...f, hasVariants: e.target.checked }))}
                  className="w-5 h-5 rounded accent-violet-600" />
                <span className="text-sm font-semibold text-gray-700">This product has variants (sizes, colors, etc.)</span>
              </label>

              {form.hasVariants && selectedCategory?.variantFields?.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  {/* Available fields info */}
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.variantFields.map(f => (
                      <span key={f.slug} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                        {f.name} {f.required && <span className="text-red-500">*</span>}
                      </span>
                    ))}
                  </div>

                  {/* Define options per field */}
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-700">Define available values per field</p>
                    {selectedCategory.variantFields.map(field => {
                      const currentOptions = form.variantOptions[field.slug] || [];
                      const isEditing = variantOptionsForm.fieldSlug === field.slug;
                      return (
                        <div key={field.slug} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">{field.name}</span>
                            <span className="text-xs text-gray-400">{currentOptions.length} option{currentOptions.length !== 1 ? 's' : ''}</span>
                          </div>
                          {currentOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {currentOptions.map((opt, i) => (
                                <span key={i} className="text-xs px-2.5 py-1 bg-white border border-gray-200 rounded-full text-gray-700 font-medium">{opt}</span>
                              ))}
                            </div>
                          )}
                          {isEditing ? (
                            <div className="space-y-2">
                              {variantOptionsForm.options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                  <input value={opt} onChange={e => { const o = [...variantOptionsForm.options]; o[i] = e.target.value; setVariantOptionsForm(prev => ({ ...prev, options: o })); }}
                                    placeholder={`Option ${i + 1}`}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                                  <button type="button" onClick={() => setVariantOptionsForm(prev => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }))}
                                    className="p-2 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <button type="button" onClick={() => setVariantOptionsForm(prev => ({ ...prev, options: [...prev.options, ''] }))}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold">+ Add Option</button>
                                <button type="button" onClick={saveVariantOptions}
                                  className="ml-auto px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Save</button>
                              </div>
                            </div>
                          ) : (
                            <button type="button"
                              onClick={() => setVariantOptionsForm({ fieldSlug: field.slug, options: currentOptions.length ? currentOptions : [''] })}
                              className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                              {currentOptions.length ? 'Edit Options' : '+ Add Options'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Bulk generate */}
                  {Object.keys(form.variantOptions).length > 0 && (
                    <div className="border border-violet-100 rounded-xl p-4 bg-violet-50/30 space-y-3">
                      <p className="text-sm font-bold text-gray-800">Bulk Generate Variants</p>
                      <div className="grid grid-cols-3 gap-3">
                        <Input label="Base Price" type="number" prefix="₹" value={bulkVariantSettings.price} placeholder={form.basePrice || '0'}
                          onChange={e => setBulkVariantSettings(s => ({ ...s, price: e.target.value }))} />
                        <Input label="MRP" type="number" prefix="₹" value={bulkVariantSettings.mrp} placeholder={form.mrp || '0'}
                          onChange={e => setBulkVariantSettings(s => ({ ...s, mrp: e.target.value }))} />
                        <Input label="Stock each" type="number" value={bulkVariantSettings.stock} placeholder="0"
                          onChange={e => setBulkVariantSettings(s => ({ ...s, stock: e.target.value }))} />
                      </div>
                      <button type="button" onClick={generateAllVariants}
                        className="px-5 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors">
                        Generate All Combinations
                      </button>
                    </div>
                  )}

                  {/* Variant list */}
                  {form.variants.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-700">{form.variants.length} Variant{form.variants.length !== 1 ? 's' : ''}</p>
                      {form.variants.map((variant, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-white hover:border-gray-200 transition-colors">
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                            <div className="md:col-span-2">
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(variant.fields || {}).map(([slug, val]) => {
                                  const fieldDef = selectedCategory?.variantFields?.find(f => f.slug === slug);
                                  return (
                                    <span key={slug} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                                      <span className="text-gray-400">{fieldDef?.name || slug}: </span>{val}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                            <input type="number" value={variant.price || ''} placeholder="Price"
                              onChange={e => { const v = [...form.variants]; v[idx].price = e.target.value; setForm(f => ({ ...f, variants: v })); }}
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <input type="number" value={variant.mrp || ''} placeholder="MRP"
                              onChange={e => { const v = [...form.variants]; v[idx].mrp = e.target.value; setForm(f => ({ ...f, variants: v })); }}
                              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <div className="flex items-center gap-2">
                              <input type="number" value={variant.stock || ''} placeholder="Stock"
                                onChange={e => { const v = [...form.variants]; v[idx].stock = e.target.value; setForm(f => ({ ...f, variants: v })); }}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <button type="button" onClick={() => removeVariant(idx)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Section 8: SEO ── */}
            <details className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">SEO Settings</span>
                  <span className="text-xs text-gray-400 font-normal">(optional)</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </summary>
              <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Meta Title" value={form.metaData.title} hint="50–60 characters recommended"
                    placeholder="Product name for search engines"
                    onChange={e => setForm(f => ({ ...f, metaData: { ...f.metaData, title: e.target.value } }))} />
                  <Input label="Meta Keywords" value={form.metaData.keywords} hint="Comma separated"
                    placeholder="curtains, blinds, window..."
                    onChange={e => setForm(f => ({ ...f, metaData: { ...f.metaData, keywords: e.target.value } }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Meta Description</label>
                  <textarea value={form.metaData.description} rows={3}
                    onChange={e => setForm(f => ({ ...f, metaData: { ...f.metaData, description: e.target.value } }))}
                    placeholder="Brief description for search engine results..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none" />
                </div>
              </div>
            </details>
          </form>
        </div>

      ) : (
        /* ── PRODUCT LIST ──────────────────────────────────────────── */
        <div className="space-y-6">

          {/* Page header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <p className="text-gray-500 text-sm mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} in your catalog</p>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Products', value: products.length,                                    bg: 'bg-blue-50',    icon: <Package className="w-5 h-5 text-blue-600" /> },
              { label: 'With Variants',  value: products.filter(p => p.hasVariants).length,         bg: 'bg-violet-50',  icon: <Settings className="w-5 h-5 text-violet-600" /> },
              { label: 'SEO Optimized',  value: products.filter(p => p.metaData?.title).length,     bg: 'bg-emerald-50', icon: <Search className="w-5 h-5 text-emerald-600" /> },
              { label: 'Custom Sized',   value: products.filter(p => p.customSize?.enabled).length, bg: 'bg-amber-50',   icon: <Layers className="w-5 h-5 text-amber-600" /> },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>{stat.icon}</div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-52">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or slug…"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm" />
            </div>
            {selectedProducts.length > 0 && (
              <>
                <span className="text-sm font-semibold text-gray-600 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm">
                  {selectedProducts.length} selected
                </span>
                <button onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                </button>
                <button onClick={() => setSelectedProducts([])}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                  Clear
                </button>
              </>
            )}
            {filteredProducts.length > 0 && (
              <label className="flex items-center gap-2 ml-auto cursor-pointer select-none">
                <input type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-sm font-medium text-gray-600">Select all</span>
              </label>
            )}
          </div>

          {/* ── Cards grid ──────────────────────────────────────────── */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-bold text-lg mb-1">{searchQuery ? 'No products found' : 'No products yet'}</p>
              <p className="text-gray-400 text-sm mb-6">{searchQuery ? `No results for "${searchQuery}"` : 'Start by adding your first product'}</p>
              {!searchQuery && (
                <button onClick={openCreate}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  <Plus className="w-4 h-4" /> Add First Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map(product => {
                const price      = parseFloat(product.basePrice || product.price || 0);
                const mrp        = parseFloat(product.mrp || 0);
                const discountPct = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
                const isSelected = selectedProducts.includes(product._id);
                const categoryName = product.categoryId?.name || categories.find(c => c._id === product.categoryId)?.name || null;

                return (
                  <div key={product._id}
                    className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5
                      ${isSelected ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>

                    {/* ── Image area ── */}
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      {product.mainImages?.[0] ? (
                        <img src={product.mainImages[0]} alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-50">
                          <ImageIcon className="w-10 h-10 text-gray-300" />
                          <span className="text-xs text-gray-400 font-medium">No image</span>
                        </div>
                      )}

                      {/* Checkbox — top left */}
                      <div className="absolute top-3 left-3 z-10">
                        <input type="checkbox" checked={isSelected}
                          onChange={e => handleProductSelect(product._id, e.target.checked)}
                          className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer shadow-md"
                          onClick={e => e.stopPropagation()} />
                      </div>

                      {/* Discount badge — top right */}
                      {discountPct > 0 && (
                        <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-md">
                          -{discountPct}%
                        </div>
                      )}

                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(product)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-800 text-sm font-bold rounded-xl shadow-lg hover:bg-blue-600 hover:text-white transition-all">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => handleDelete(product._id)}
                          className="p-2 bg-white text-gray-600 rounded-xl shadow-lg hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom image badges */}
                      {(product.hasVariants || product.customSize?.enabled) && (
                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                          {product.hasVariants && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                              {product.variants?.length || 0} variants
                            </span>
                          )}
                          {product.customSize?.enabled && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-sm">
                              Custom size
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Card info ── */}
                    <div className="p-4 space-y-2.5">
                      {/* Category */}
                      {categoryName && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 truncate max-w-[75%]">
                            {categoryName}
                          </span>
                          {product.metaData?.title && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              SEO ✓
                            </span>
                          )}
                        </div>
                      )}

                      {/* Name */}
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem]">
                        {product.name}
                      </h3>

                      {/* Divider */}
                      <div className="h-px bg-gray-100" />

                      {/* Price row */}
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-base font-extrabold text-gray-900">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          {mrp > price && (
                            <span className="ml-2 text-xs text-gray-400 line-through">
                              ₹{mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {/* Quick actions for non-hover (mobile) */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-0 transition-opacity">
                          <button onClick={() => handleEdit(product)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(product._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add new product card */}
              <button onClick={openCreate}
                className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl min-h-[280px] text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all group">
                <div className="w-12 h-12 border-2 border-dashed border-current rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold">Add Product</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
