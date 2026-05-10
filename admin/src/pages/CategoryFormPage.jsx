import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../context/ToastContext'
import { updateCategory } from '../store/slices/categorySlice'
import api from '../api/client'
import TipTapEditor from '../components/TipTapEditor'
import {
  ArrowLeft, Save, Upload, X, Tag, Globe, Image as ImageIcon,
} from 'lucide-react'

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

const EMPTY_FORM = {
  name: '', slug: '', image: null, imagePreview: null,
  seoContent: '', order: 0, mainCategoryId: '',
  metaData: { title: '', description: '', keywords: '' },
}

const TABS = [
  { id: 'basic', label: 'Basic Info', Icon: Tag    },
  { id: 'seo',   label: 'SEO',        Icon: Globe  },
]

function CharCount({ value, max }) {
  const len = (value || '').length
  const pct = len / max
  return (
    <span className={`text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md ${
      len > max
        ? 'bg-red-50 text-red-500'
        : pct > 0.85
        ? 'bg-amber-50 text-amber-500'
        : 'bg-gray-100 text-gray-400'
    }`}>
      {len}/{max}
    </span>
  )
}

function Field({ label, hint, required, counter, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {counter}
      </div>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

const inputCls = `
  w-full px-4 py-3 text-base text-gray-900
  bg-gray-50 border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 focus:bg-white
  transition-all placeholder:text-gray-400
`

const selectCls = `
  w-full px-4 py-3 text-base text-gray-900
  bg-gray-50 border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 focus:bg-white
  transition-all appearance-none
`

export default function CategoryFormPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const location   = useLocation()
  const dispatch   = useDispatch()
  const { showToast } = useToast()

  const isEditing = Boolean(id)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [mainCategories, setMainCats] = useState([])
  const [loading, setLoading]         = useState(isEditing)
  const [saving, setSaving]           = useState(false)
  const [tab, setTab]                 = useState('basic')

  useEffect(() => {
    api.get('/main-categories')
      .then(({ data }) => setMainCats(Array.isArray(data?.data) ? data.data : []))
      .catch(() => {})

    if (!isEditing) return

    const fromNav = location.state?.category
    if (fromNav) {
      populateForm(fromNav)
      setLoading(false)
    } else {
      api.get('/categories')
        .then(({ data }) => {
          const cat = (Array.isArray(data) ? data : []).find(c => c._id === id)
          if (cat) populateForm(cat)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  function populateForm(cat) {
    setForm({
      name:           cat.name || '',
      slug:           cat.slug || '',
      image:          null,
      imagePreview:   cat.image || null,
      seoContent:     cat.seoContent || '',
      order:          cat.order || 0,
      mainCategoryId: cat.mainCategoryId?._id || cat.mainCategoryId || '',
      metaData: {
        title:       cat.metaData?.title || '',
        description: cat.metaData?.description || '',
        keywords:    Array.isArray(cat.metaData?.keywords)
                       ? cat.metaData.keywords.join(', ')
                       : (cat.metaData?.keywords || ''),
      },
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({ ...f, image: file, imagePreview: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('slug', form.slug)
    fd.append('seoContent', form.seoContent)
    fd.append('order', form.order)
    fd.append('mainCategoryId', form.mainCategoryId)
    fd.append('type', 'sub')
    fd.append('metaData[title]', form.metaData.title)
    fd.append('metaData[description]', form.metaData.description)
    fd.append('metaData[keywords]', form.metaData.keywords)
    if (form.image) fd.append('image', form.image)

    try {
      if (isEditing) {
        await dispatch(updateCategory({ id, payload: fd })).unwrap()
        showToast('success', 'Category updated!')
      } else {
        await api.post('/categories', fd)
        showToast('success', 'Category created!')
      }
      navigate('/categories')
    } catch (err) {
      showToast('error', err?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <button type="button" onClick={() => navigate('/categories')}
          className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {isEditing ? 'Edit Subcategory' : 'New Subcategory'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEditing ? `Editing: ${form.name}` : 'Fill in the details to create a new subcategory'}
          </p>
        </div>
        <button type="button" onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm shadow-blue-200">
          {saving
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : (isEditing ? 'Update' : 'Create')}
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Tab Bar ─────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-gray-100/80 p-1 rounded-2xl w-fit">
          {TABS.map(({ id: tid, label, Icon }) => (
            <button key={tid} type="button" onClick={() => setTab(tid)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === tid
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-5">

          {/* ── Basic Info Tab ──────────────────────────────────── */}
          {tab === 'basic' && (
            <>
              {/* Core fields card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Tag className="w-[18px] h-[18px] text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Basic Information</p>
                    <p className="text-xs text-gray-400">Identity and placement of this category</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Category Name" required hint="The display name shown to customers">
                    <input type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      onBlur={() => !isEditing && setForm(f => ({ ...f, slug: slugify(f.name) }))}
                      placeholder="e.g., Curtains"
                      className={inputCls} />
                  </Field>

                  <Field label="URL Slug" required hint="Auto-generated from name · used in URLs">
                    <input type="text" required value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                      placeholder="e.g., curtains"
                      className={inputCls + ' font-mono'} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Main Category" required>
                    <div className="relative">
                      <select required value={form.mainCategoryId}
                        onChange={e => setForm(f => ({ ...f, mainCategoryId: e.target.value }))}
                        className={selectCls}>
                        <option value="">Select a main category</option>
                        {mainCategories.map(mc => <option key={mc._id} value={mc._id}>{mc.name}</option>)}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </Field>

                  <Field label="Display Order" hint="Lower number = appears first in lists">
                    <input type="number" min="0" value={form.order}
                      onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                      className={inputCls} />
                  </Field>
                </div>
              </div>

              {/* Image Upload card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-[18px] h-[18px] text-pink-500" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Category Image</p>
                    <p className="text-xs text-gray-400">Shown in category listings and navigation menus</p>
                  </div>
                </div>

                {form.imagePreview ? (
                  <div className="flex items-start gap-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="relative flex-shrink-0">
                      <img src={form.imagePreview} alt="preview"
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm" />
                      <button type="button"
                        onClick={() => setForm(f => ({ ...f, image: null, imagePreview: null }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Image attached</p>
                      <p className="text-xs text-gray-400 mb-3">Tap × to remove, then upload a replacement</p>
                      <input type="file" accept="image/*" onChange={handleImageChange}
                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all cursor-pointer" />
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50/20 transition-all group">
                    <div className="w-11 h-11 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-2.5 transition-colors">
                      <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </>
          )}

          {/* ── SEO Tab ─────────────────────────────────────────── */}
          {tab === 'seo' && (
            <>
              {/* Meta fields card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Globe className="w-[18px] h-[18px] text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">SEO Metadata</p>
                    <p className="text-xs text-gray-400">Controls how this page appears in Google search results</p>
                  </div>
                </div>

                <Field
                  label="Meta Title"
                  hint="50–60 characters recommended for best Google display"
                  counter={<CharCount value={form.metaData.title} max={60} />}
                >
                  <input type="text" value={form.metaData.title}
                    onChange={e => setForm(f => ({ ...f, metaData: { ...f.metaData, title: e.target.value } }))}
                    placeholder="e.g., Buy Premium Curtains Online | HomelineTeam"
                    className={inputCls} />
                </Field>

                <Field
                  label="Meta Description"
                  hint="150–160 characters · shown below your title in search results"
                  counter={<CharCount value={form.metaData.description} max={160} />}
                >
                  <textarea rows={4} value={form.metaData.description}
                    onChange={e => setForm(f => ({ ...f, metaData: { ...f.metaData, description: e.target.value } }))}
                    placeholder="Brief, compelling description shown in Google search results. Mention key benefits and include target keywords."
                    className={inputCls + ' resize-none'} />
                </Field>

                <Field label="Keywords" hint="Separate multiple keywords with commas">
                  <input type="text" value={form.metaData.keywords}
                    onChange={e => setForm(f => ({ ...f, metaData: { ...f.metaData, keywords: e.target.value } }))}
                    placeholder="curtains, window curtains, blackout curtains, home decor"
                    className={inputCls} />
                </Field>

                {/* Google SERP Preview */}
                {(form.metaData.title || form.metaData.description) && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1.5">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Google Preview
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-[17px] text-blue-700 font-medium leading-snug truncate">
                        {form.metaData.title || form.name || 'Page Title'}
                      </p>
                      <p className="text-xs text-green-700 font-medium">
                        homelineteam.com › {form.slug || 'category'}
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 pt-0.5">
                        {form.metaData.description || 'No description provided yet.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Content card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                      <svg className="w-[18px] h-[18px] text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">SEO Content</p>
                      <p className="text-xs text-gray-400">Long-form content displayed below products on the category page</p>
                    </div>
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-3 py-1 rounded-full">
                    Helps Rankings
                  </span>
                </div>

                <TipTapEditor
                  value={form.seoContent}
                  onChange={v => setForm(f => ({ ...f, seoContent: v }))}
                  placeholder="Write detailed content about this category — buying guides, material comparisons, care tips, FAQs. Aim for 300+ words with natural keyword usage."
                  minHeight={280}
                />
              </div>
            </>
          )}

          {/* ── Footer ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 pb-4">
            <button type="button" onClick={() => navigate('/categories')}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {tab === 'basic' && (
                <button type="button" onClick={() => setTab('seo')}
                  className="px-6 py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  SEO Settings →
                </button>
              )}
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-7 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm shadow-blue-200">
                {saving
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : (isEditing ? 'Update Category' : 'Create Category')}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
