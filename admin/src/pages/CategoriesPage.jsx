import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../context/ToastContext'
import {
  updateCategory, deleteCategory,
  addCustomField, updateCustomField, deleteCustomField,
  addVariantField, updateVariantField, deleteVariantField,
  clearError,
} from '../store/slices/categorySlice'
import api from '../api/client'
import {
  Plus, FolderOpen, X, Edit3, Trash2, Settings, Tag,
  ChevronDown, ChevronUp, Layers, ArrowRight, Search,
  Hash, BarChart3,
} from 'lucide-react'

/* ─── helpers ────────────────────────────────────────────────────── */
const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

const FIELD_TYPES_CUSTOM  = ['text', 'number', 'dropdown', 'multi-select', 'boolean', 'image', 'rich-text']
const FIELD_TYPES_VARIANT = ['dropdown', 'number', 'text']
const BLANK_CF = { name: '', slug: '', type: 'text', options: [''], required: false, visibleOnProduct: true }
const BLANK_VF = { name: '', slug: '', type: 'dropdown', options: [''], required: false, unit: '', basePrice: 0, order: 1 }

const TYPE_CHIP = {
  text:           'bg-sky-100 text-sky-700',
  number:         'bg-amber-100 text-amber-700',
  dropdown:       'bg-violet-100 text-violet-700',
  'multi-select': 'bg-indigo-100 text-indigo-700',
  boolean:        'bg-orange-100 text-orange-700',
  image:          'bg-pink-100 text-pink-700',
  'rich-text':    'bg-teal-100 text-teal-700',
}

// Color palettes for main category cards
const MC_COLORS = [
  { card: 'from-blue-500 to-blue-600',    light: 'bg-blue-50 text-blue-700 border-blue-100'   },
  { card: 'from-violet-500 to-purple-600',light: 'bg-violet-50 text-violet-700 border-violet-100' },
  { card: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { card: 'from-orange-500 to-amber-600', light: 'bg-orange-50 text-orange-700 border-orange-100' },
  { card: 'from-rose-500 to-pink-600',    light: 'bg-rose-50 text-rose-700 border-rose-100'   },
  { card: 'from-indigo-500 to-blue-600',  light: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { card: 'from-cyan-500 to-sky-600',     light: 'bg-cyan-50 text-cyan-700 border-cyan-100'   },
  { card: 'from-fuchsia-500 to-violet-600',light:'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100'},
]

/* ─── shared field form inputs ────────────────────────────────────── */
function FieldInput({ label, required: req, hint, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
          {label} {req && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all placeholder:text-gray-400"
        required={req}
        {...props}
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function OptionsList({ options, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Options</label>
      <div className="space-y-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; onChange(o) }}
              placeholder={`Option ${i + 1}`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={() => onChange(options.filter((_, idx) => idx !== i))}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...options, ''])}
          className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800 mt-1 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add Option
        </button>
      </div>
    </div>
  )
}

/* ─── modal shell ─────────────────────────────────────────────────── */
function Modal({ title, subtitle, icon: Icon, iconBg, onClose, children }) {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          {Icon && (
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg || 'bg-blue-50'}`}>
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

function ModalBody({ children }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0" style={{ scrollbarWidth: 'none' }}>
      {children}
    </div>
  )
}

function ModalFooter({ onCancel, submitLabel, loading }) {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
      <button type="button" onClick={onCancel}
        className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
        Cancel
      </button>
      <button type="submit" disabled={loading}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60 transition-colors shadow-sm">
        {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {submitLabel}
      </button>
    </div>
  )
}

/* ─── field row in expanded panel ─────────────────────────────────── */
function FieldRow({ field, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
      <span className={`text-sm font-bold px-3 py-1.5 rounded-xl whitespace-nowrap flex-shrink-0 ${TYPE_CHIP[field.type] || TYPE_CHIP.text}`}>
        {field.type}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-gray-900 leading-snug">{field.name}</p>
        <p className="text-sm text-gray-400 font-mono mt-0.5">{field.slug}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {field.required && (
          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">Required</span>
        )}
        {field.basePrice > 0 && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">+₹{field.basePrice}</span>
        )}
        {field.visibleOnProduct === false && (
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-lg">Hidden</span>
        )}
        <button onClick={onEdit}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all">
          <Edit3 className="w-4 h-4" />
        </button>
        <button onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════ */
export default function CategoriesPage() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const { error }  = useSelector(s => s.categories)
  const { showToast } = useToast()

  const [categories, setCategories]     = useState([])
  const [mainCategories, setMainCats]   = useState([])
  const [loadingCats, setLoadingCats]   = useState(true)
  const [loadingMain, setLoadingMain]   = useState(true)
  const [expandedId, setExpandedId]     = useState(null)
  const [search, setSearch]             = useState('')

  /* field modals */
  const [cfModal, setCfModal] = useState(false)
  const [vfModal, setVfModal] = useState(false)
  const [targetCat, setTargetCat] = useState(null)
  const [editCf, setEditCf]   = useState(null)
  const [editVf, setEditVf]   = useState(null)
  const [cfForm, setCfForm]   = useState(BLANK_CF)
  const [vfForm, setVfForm]   = useState(BLANK_VF)

  /* ── fetch ───────────────────────────────────────────────────── */
  const fetchCategories = async () => {
    setLoadingCats(true)
    try {
      const { data } = await api.get('/categories')
      setCategories(Array.isArray(data) ? data : [])
    } catch { setCategories([]) }
    finally { setLoadingCats(false) }
  }

  const fetchMainCategories = async () => {
    setLoadingMain(true)
    try {
      const { data } = await api.get('/main-categories')
      setMainCats(Array.isArray(data?.data) ? data.data : [])
    } catch { setMainCats([]) }
    finally { setLoadingMain(false) }
  }

  useEffect(() => { fetchCategories(); fetchMainCategories() }, [])

  useEffect(() => {
    if (!error) return
    showToast('error', error)
    const t = setTimeout(() => dispatch(clearError()), 5000)
    return () => clearTimeout(t)
  }, [error, dispatch])

  /* ── category actions ────────────────────────────────────────── */
  const handleDeleteCat = async (id) => {
    if (!confirm('Delete this subcategory?')) return
    try {
      await dispatch(deleteCategory(id)).unwrap()
      showToast('success', 'Category deleted')
      await fetchCategories()
    } catch (err) { showToast('error', err?.message || 'Delete failed') }
  }

  const handleDeleteMain = async (mc) => {
    const hasSubs = categories.some(c => (c.mainCategoryId?._id || c.mainCategoryId) === mc._id)
    if (hasSubs) { showToast('error', 'Remove all subcategories first'); return }
    if (!confirm(`Delete "${mc.name}"?`)) return
    try {
      await api.delete(`/main-categories/${mc._id}`)
      showToast('success', 'Main category deleted')
      await fetchMainCategories()
    } catch (err) { showToast('error', err.response?.data?.message || 'Delete failed') }
  }

  /* ── custom field handlers ───────────────────────────────────── */
  const openCfModal = (cat, field = null) => {
    setTargetCat(cat); setEditCf(field)
    setCfForm(field ? {
      name: field.name, slug: field.slug, type: field.type,
      options: field.options?.length ? field.options : [''],
      required: field.required || false, visibleOnProduct: field.visibleOnProduct ?? true
    } : BLANK_CF)
    setCfModal(true)
  }

  const handleCfSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...cfForm, slug: cfForm.slug || slugify(cfForm.name) }
    try {
      if (editCf) {
        await dispatch(updateCustomField({ id: targetCat._id, fieldId: editCf.slug, payload })).unwrap()
        showToast('success', 'Custom field updated')
      } else {
        await dispatch(addCustomField({ id: targetCat._id, payload })).unwrap()
        showToast('success', 'Custom field added')
      }
      setCfModal(false); await fetchCategories()
    } catch (err) { showToast('error', err?.message || 'Failed') }
  }

  const handleDeleteCf = async (cat, field) => {
    if (!confirm(`Delete "${field.name}"?`)) return
    try {
      await dispatch(deleteCustomField({ id: cat._id, fieldId: field.slug })).unwrap()
      showToast('success', 'Field deleted'); await fetchCategories()
    } catch (err) { showToast('error', err?.message || 'Delete failed') }
  }

  /* ── variant field handlers ──────────────────────────────────── */
  const openVfModal = (cat, field = null) => {
    setTargetCat(cat); setEditVf(field)
    setVfForm(field ? {
      name: field.name, slug: field.slug, type: field.type,
      options: field.options?.length ? field.options : [''],
      required: field.required || false,
      unit: field.unit || '', basePrice: field.basePrice || 0, order: field.order || 1
    } : BLANK_VF)
    setVfModal(true)
  }

  const handleVfSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...vfForm, slug: vfForm.slug || slugify(vfForm.name) }
    try {
      if (editVf) {
        await dispatch(updateVariantField({ id: targetCat._id, fieldId: editVf.slug || editVf._id, payload })).unwrap()
        showToast('success', 'Variant field updated')
      } else {
        await dispatch(addVariantField({ id: targetCat._id, payload })).unwrap()
        showToast('success', 'Variant field added')
      }
      setVfModal(false); await fetchCategories()
    } catch (err) { showToast('error', err?.message || 'Failed') }
  }

  const handleDeleteVf = async (cat, field) => {
    if (!confirm(`Delete "${field.name}"?`)) return
    try {
      await dispatch(deleteVariantField({ id: cat._id, fieldId: field.slug || field._id })).unwrap()
      showToast('success', 'Variant field deleted'); await fetchCategories()
    } catch (err) { showToast('error', err?.message || 'Delete failed') }
  }

  /* ── derived ─────────────────────────────────────────────────── */
  const totalFields = categories.reduce((n, c) => n + (c.customFields?.length || 0) + (c.variantFields?.length || 0), 0)
  const filtered    = search
    ? categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()))
    : categories

  /* ══════════════════════ RENDER ═══════════════════════════════ */
  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product taxonomy</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/categories/new-main')}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Main Category
          </button>
          <button onClick={() => navigate('/categories/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-200">
            <Plus className="w-4 h-4" /> Add Subcategory
          </button>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Main Categories', value: mainCategories.length, icon: Layers,   color: 'blue'   },
          { label: 'Subcategories',   value: categories.length,     icon: FolderOpen,color: 'violet' },
          { label: 'Total Fields',    value: totalFields,            icon: Hash,     color: 'emerald'},
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-${color}-50`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Categories ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Main Categories</h2>
              <p className="text-xs text-gray-400">Top-level navigation groups</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {mainCategories.length} total
          </span>
        </div>

        {loadingMain ? (
          <div className="p-10 flex justify-center">
            <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : mainCategories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-7 h-7 text-blue-500" />
            </div>
            <p className="text-gray-700 font-bold mb-1">No main categories yet</p>
            <p className="text-gray-400 text-sm mb-4">Create a main category to start organizing your products</p>
            <button onClick={() => navigate('/categories/new-main')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Create First Category
            </button>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mainCategories.map((mc, idx) => {
              const pal      = MC_COLORS[idx % MC_COLORS.length]
              const subCount = categories.filter(c => (c.mainCategoryId?._id || c.mainCategoryId) === mc._id).length
              return (
                <div key={mc._id}
                  className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  {/* Gradient top strip */}
                  <div className={`h-2 bg-gradient-to-r ${pal.card}`} />
                  <div className="p-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pal.card} flex items-center justify-center mb-3`}>
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate mb-0.5">{mc.name}</p>
                    <p className="text-xs text-gray-400 truncate mb-3 font-mono">/{mc.slug}</p>
                    <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border ${pal.light}`}>
                      {subCount} sub{subCount !== 1 ? 's' : ''}
                    </span>
                    {/* Actions */}
                    <div className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate(`/categories/edit-main/${mc._id}`, { state: { mainCategory: mc } })}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteMain(mc)}
                        className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-red-600 hover:border-red-200 shadow-sm transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            {/* Add new card */}
            <button onClick={() => navigate('/categories/new-main')}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all min-h-[130px]">
              <div className="w-10 h-10 border-2 border-dashed border-current rounded-xl flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">New Category</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Subcategories ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Subcategories</h2>
              <p className="text-xs text-gray-400">Click a row to manage fields</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subcategories…"
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 transition-all" />
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap">
              {filtered.length} of {categories.length}
            </span>
          </div>
        </div>

        {loadingCats ? (
          <div className="p-10 flex justify-center">
            <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag className="w-7 h-7 text-violet-500" />
            </div>
            <p className="text-gray-700 font-bold mb-1">No subcategories yet</p>
            <p className="text-gray-400 text-sm mb-4">Create your first subcategory to organize products</p>
            <button onClick={() => navigate('/categories/new')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add Subcategory
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No results for "{search}"</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((cat) => {
              const isOpen  = expandedId === cat._id
              const mcIdx   = mainCategories.findIndex(mc => mc._id === (cat.mainCategoryId?._id || cat.mainCategoryId))
              const mcName  = mcIdx >= 0 ? mainCategories[mcIdx].name : cat.mainCategoryId?.name || '—'
              const mcPal   = mcIdx >= 0 ? MC_COLORS[mcIdx % MC_COLORS.length] : null
              const mcColor = mcPal ? mcPal.light : 'bg-gray-100 text-gray-500 border-gray-200'
              const cfCount = cat.customFields?.length  || 0
              const vfCount = cat.variantFields?.length || 0

              return (
                <div key={cat._id} className={isOpen ? 'bg-indigo-50/30' : ''}>

                  {/* ── Row ────────────────────────────────────── */}
                  <div
                    className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-all ${isOpen ? '' : 'hover:bg-gray-50'}`}
                    onClick={() => setExpandedId(isOpen ? null : cat._id)}
                  >
                    {/* Thumbnail */}
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name}
                        className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border-2 border-white shadow-md" />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${mcPal ? `bg-gradient-to-br ${mcPal.card}` : 'bg-gradient-to-br from-violet-400 to-purple-500'}`}>
                        <FolderOpen className="w-7 h-7 text-white" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-extrabold text-gray-900 leading-tight">{cat.name}</p>
                      <p className="text-sm text-gray-400 font-mono mt-0.5">/{cat.slug}</p>
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <span className={`text-sm font-bold px-3 py-1 rounded-xl border ${mcColor}`}>{mcName}</span>
                        <span className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-xl">
                          {cfCount} {cfCount === 1 ? 'Field' : 'Fields'}
                        </span>
                        <span className="text-sm font-bold text-violet-700 bg-violet-50 border border-violet-100 px-3 py-1 rounded-xl">
                          {vfCount} {vfCount === 1 ? 'Variant' : 'Variants'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons — stopPropagation so clicking them doesn't toggle expand */}
                    <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/categories/edit/${cat._id}`, { state: { category: cat } })}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-xl transition-colors">
                        <Edit3 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDeleteCat(cat._id)}
                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    {/* Expand chevron — separate from stopPropagation div so the row onClick also works */}
                    <div className="flex-shrink-0 ml-1">
                      <div className={`p-2.5 rounded-xl transition-all ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* ── Expanded Panel ─────────────────────────── */}
                  {isOpen && (
                    <div className="mx-5 mb-5 rounded-3xl border border-indigo-100 bg-white shadow-lg overflow-hidden">

                      {/* Header strip */}
                      <div className={`px-6 py-5 bg-gradient-to-r ${mcPal ? mcPal.card : 'from-violet-500 to-purple-600'} flex items-center gap-5`}>
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name}
                            className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-lg flex-shrink-0" />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border-4 border-white/30">
                            <FolderOpen className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-extrabold text-white leading-tight">{cat.name}</h3>
                          <p className="text-white/70 font-mono text-sm mt-1">/{cat.slug}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="text-sm font-bold bg-white/20 text-white border border-white/30 px-3 py-1 rounded-xl backdrop-blur-sm">
                              {mcName}
                            </span>
                            {cat.order !== undefined && (
                              <span className="text-sm font-bold bg-white/20 text-white border border-white/30 px-3 py-1 rounded-xl backdrop-blur-sm">
                                Display Order: {cat.order}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/categories/edit/${cat._id}`, { state: { category: cat } })}
                          className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 text-sm font-bold rounded-2xl hover:bg-gray-50 transition-colors shadow-md flex-shrink-0">
                          <Edit3 className="w-4 h-4" /> Edit Category
                        </button>
                      </div>

                      {/* Fields panels */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                        {/* Custom Fields */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-sm">
                                <Tag className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-base font-extrabold text-gray-900">Custom Fields</p>
                                <p className="text-sm text-gray-400">Spec attributes for products</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {cfCount > 0 && (
                                <span className="text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-xl">{cfCount}</span>
                              )}
                              <button onClick={() => openCfModal(cat)}
                                className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 px-4 py-2 rounded-xl transition-all">
                                <Plus className="w-4 h-4" /> Add Field
                              </button>
                            </div>
                          </div>
                          {cfCount === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Tag className="w-6 h-6 text-blue-300" />
                              </div>
                              <p className="text-gray-700 font-bold text-base mb-1">No custom fields</p>
                              <p className="text-gray-400 text-sm mb-4">Add fields like Material, Color, Dimensions</p>
                              <button onClick={() => openCfModal(cat)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
                                <Plus className="w-4 h-4" /> Add First Field
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {cat.customFields.map((field, i) => (
                                <FieldRow key={i} field={field}
                                  onEdit={() => openCfModal(cat, field)}
                                  onDelete={() => handleDeleteCf(cat, field)} />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Variant Fields */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-sm">
                                <Settings className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-base font-extrabold text-gray-900">Variant Fields</p>
                                <p className="text-sm text-gray-400">Size, color & option groups</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {vfCount > 0 && (
                                <span className="text-sm font-extrabold text-violet-700 bg-violet-100 px-3 py-1 rounded-xl">{vfCount}</span>
                              )}
                              <button onClick={() => openVfModal(cat)}
                                className="flex items-center gap-2 text-sm font-bold text-violet-600 bg-violet-50 hover:bg-violet-600 hover:text-white border border-violet-200 px-4 py-2 rounded-xl transition-all">
                                <Plus className="w-4 h-4" /> Add Variant
                              </button>
                            </div>
                          </div>
                          {vfCount === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                              <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Settings className="w-6 h-6 text-violet-300" />
                              </div>
                              <p className="text-gray-700 font-bold text-base mb-1">No variant fields</p>
                              <p className="text-gray-400 text-sm mb-4">Add options like Size, Width, Fabric type</p>
                              <button onClick={() => openVfModal(cat)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors">
                                <Plus className="w-4 h-4" /> Add First Variant
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              {cat.variantFields.map((field, i) => (
                                <FieldRow key={field._id || i} field={field}
                                  onEdit={() => openVfModal(cat, field)}
                                  onDelete={() => handleDeleteVf(cat, field)} />
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ══════════ FIELD MODALS ══════════ */}

      {/* Custom Field Modal */}
      {cfModal && targetCat && (
        <Modal title={editCf ? 'Edit Custom Field' : 'Add Custom Field'}
          subtitle={`For: ${targetCat.name}`} icon={Tag} onClose={() => setCfModal(false)}>
          <form onSubmit={handleCfSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <ModalBody>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Field Name" required value={cfForm.name}
                  placeholder="e.g., Material"
                  onChange={e => setCfForm(f => ({ ...f, name: e.target.value }))}
                  onBlur={() => !cfForm.slug && setCfForm(f => ({ ...f, slug: slugify(f.name) }))} />
                <FieldInput label="Slug" required value={cfForm.slug}
                  placeholder="e.g., material"
                  onChange={e => setCfForm(f => ({ ...f, slug: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Field Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {FIELD_TYPES_CUSTOM.map(t => (
                    <button key={t} type="button" onClick={() => setCfForm(f => ({ ...f, type: t }))}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center
                        ${cfForm.type === t ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {(cfForm.type === 'dropdown' || cfForm.type === 'multi-select') && (
                <OptionsList options={cfForm.options} onChange={o => setCfForm(f => ({ ...f, options: o }))} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <input type="checkbox" checked={cfForm.required}
                    onChange={e => setCfForm(f => ({ ...f, required: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Required</p>
                    <p className="text-xs text-gray-400">Must fill when adding product</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <input type="checkbox" checked={cfForm.visibleOnProduct}
                    onChange={e => setCfForm(f => ({ ...f, visibleOnProduct: e.target.checked }))}
                    className="w-4 h-4 rounded accent-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Visible</p>
                    <p className="text-xs text-gray-400">Show on product page</p>
                  </div>
                </label>
              </div>
            </ModalBody>
            <ModalFooter onCancel={() => setCfModal(false)} submitLabel={editCf ? 'Update Field' : 'Add Field'} />
          </form>
        </Modal>
      )}

      {/* Variant Field Modal */}
      {vfModal && targetCat && (
        <Modal title={editVf ? 'Edit Variant Field' : 'Add Variant Field'}
          subtitle={`For: ${targetCat.name}`} icon={Settings} iconBg="bg-violet-50" onClose={() => setVfModal(false)}>
          <form onSubmit={handleVfSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            <ModalBody>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Field Name" required value={vfForm.name}
                  placeholder="e.g., Size"
                  onChange={e => setVfForm(f => ({ ...f, name: e.target.value }))}
                  onBlur={() => !vfForm.slug && setVfForm(f => ({ ...f, slug: slugify(f.name) }))} />
                <FieldInput label="Slug" required value={vfForm.slug}
                  placeholder="e.g., size"
                  onChange={e => setVfForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Type <span className="text-red-500">*</span></label>
                  <select value={vfForm.type} onChange={e => setVfForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white">
                    {FIELD_TYPES_VARIANT.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <FieldInput label="Base Price (₹)" type="number" min="0" value={vfForm.basePrice}
                  hint="Extra cost for this variant"
                  onChange={e => setVfForm(f => ({ ...f, basePrice: Number(e.target.value) }))} />
              </div>
              {vfForm.type === 'dropdown' && (
                <OptionsList options={vfForm.options} onChange={o => setVfForm(f => ({ ...f, options: o }))} />
              )}
              <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-violet-50 hover:border-violet-200 transition-colors">
                <input type="checkbox" checked={vfForm.required}
                  onChange={e => setVfForm(f => ({ ...f, required: e.target.checked }))}
                  className="w-4 h-4 rounded accent-violet-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Required</p>
                  <p className="text-xs text-gray-400">Customer must select before ordering</p>
                </div>
              </label>
            </ModalBody>
            <ModalFooter onCancel={() => setVfModal(false)} submitLabel={editVf ? 'Update Variant' : 'Add Variant'} />
          </form>
        </Modal>
      )}
    </div>
  )
}
