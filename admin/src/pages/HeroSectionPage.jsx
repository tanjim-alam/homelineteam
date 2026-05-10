import { useState, useEffect } from 'react'
import { Upload, Trash2, Plus, ArrowUp, ArrowDown, Layers, Settings, ImageIcon, ToggleLeft, ToggleRight, Monitor } from 'lucide-react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'

const TABS = [
  { id: 'banners',    label: 'Banner Images',  Icon: Monitor },
  { id: 'categories', label: 'Categories',     Icon: Layers  },
  { id: 'settings',   label: 'Slider Settings',Icon: Settings},
]

const EMPTY_HERO = {
  mobileBackgroundImages:  [],
  desktopBackgroundImages: [],
  categories: [],
  sliderSettings: { autoSlide: true, slideInterval: 3000, transitionDuration: 1000 },
}

/* ─── BannerCard ───────────────────────────────────────────────── */
function BannerCard({ image, index, total, onSaveField, onToggle, onDelete, onMoveUp, onMoveDown }) {
  const [altText, setAltText] = useState(image.altText || '')
  useEffect(() => setAltText(image.altText || ''), [image.altText])

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${image.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-55'}`}>
      {/* Preview */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img src={image.imageUrl} alt={altText} className="w-full h-full object-cover" />
      </div>

      <div className="p-4 space-y-3">
        {/* Alt text */}
        <input
          type="text"
          value={altText}
          onChange={e => setAltText(e.target.value)}
          onBlur={() => onSaveField(index, 'altText', altText)}
          placeholder="Image description (for SEO)"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 transition-all"
        />

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Active toggle */}
          <button
            type="button"
            onClick={() => onToggle(index)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              image.isActive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {image.isActive
              ? <ToggleRight className="w-4 h-4" />
              : <ToggleLeft  className="w-4 h-4" />}
            {image.isActive ? 'Active' : 'Inactive'}
          </button>

          {/* Order + delete */}
          <div className="flex items-center gap-1">
            {index > 0 && (
              <button onClick={() => onMoveUp(index)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Move up">
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
            {index < total - 1 && (
              <button onClick={() => onMoveDown(index)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Move down">
                <ArrowDown className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => onDelete(index)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── CategoryCard ─────────────────────────────────────────────── */
function CategoryCard({ cat, index, total, onSaveField, onToggle, onDelete, onMoveUp, onMoveDown }) {
  const [title,   setTitle]   = useState(cat.title   || '')
  const [link,    setLink]    = useState(cat.link    || '')
  const [altText, setAltText] = useState(cat.altText || '')

  useEffect(() => { setTitle(cat.title || ''); setLink(cat.link || ''); setAltText(cat.altText || '') },
    [cat.title, cat.link, cat.altText])

  const inCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 transition-all'

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${cat.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-55'}`}>
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img src={cat.imageUrl} alt={altText} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 space-y-2.5">
        <input value={title}   onChange={e => setTitle(e.target.value)}   onBlur={() => onSaveField(index, 'title', title)}   placeholder="Category title *" className={inCls} />
        <input value={link}    onChange={e => setLink(e.target.value)}    onBlur={() => onSaveField(index, 'link', link)}     placeholder="Link URL (e.g. /window-solution)" className={inCls} />
        <input value={altText} onChange={e => setAltText(e.target.value)} onBlur={() => onSaveField(index, 'altText', altText)} placeholder="Alt text (optional)" className={inCls} />
        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={() => onToggle(index)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              cat.isActive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
            {cat.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {cat.isActive ? 'Active' : 'Inactive'}
          </button>
          <div className="flex gap-1">
            {index > 0        && <button onClick={() => onMoveUp(index)}   className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ArrowUp   className="w-4 h-4" /></button>}
            {index < total - 1 && <button onClick={() => onMoveDown(index)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ArrowDown className="w-4 h-4" /></button>}
            <button onClick={() => onDelete(index)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ────────────────────────────────────────────────── */
export default function HeroSectionPage() {
  const { showToast } = useToast()
  const [heroData, setHeroData]   = useState(EMPTY_HERO)
  const [loading, setLoading]     = useState(true)
  const [saving,  setSaving]      = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('banners')
  const [newCat,  setNewCat]      = useState({ title: '', link: '', altText: '' })

  useEffect(() => {
    apiClient.get('/hero-section')
      .then(res => { if (res.data.success) setHeroData(res.data.data || EMPTY_HERO) })
      .catch(() => showToast('error', 'Failed to load hero section'))
      .finally(() => setLoading(false))
  }, [])

  const persist = async (data) => {
    try {
      const res = await apiClient.put('/hero-section', data)
      if (!res.data.success) throw new Error()
    } catch {
      showToast('error', 'Failed to save changes')
    }
  }

  /* Upload banner image — saves to BOTH arrays so same image shows on all devices */
  const handleBannerUpload = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await apiClient.post('/hero-section/upload-image?type=desktop', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (!res.data.success) throw new Error(res.data.message || 'Upload failed')

      const newImage = {
        imageUrl: res.data.data.imageUrl,
        publicId: res.data.data.publicId || '',
        altText:  file.name.replace(/\.[^.]+$/, ''),
        isActive: true,
      }

      // Save to BOTH desktop and mobile so image shows on all devices
      const updated = {
        ...heroData,
        desktopBackgroundImages: [
          ...heroData.desktopBackgroundImages,
          { ...newImage, order: heroData.desktopBackgroundImages.length },
        ],
        mobileBackgroundImages: [
          ...heroData.mobileBackgroundImages,
          { ...newImage, order: heroData.mobileBackgroundImages.length },
        ],
      }
      setHeroData(updated)
      await persist(updated)
      showToast('success', 'Banner image uploaded')
    } catch (err) {
      showToast('error', err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleCategoryUpload = async (file) => {
    if (!file) return
    if (!newCat.title || !newCat.link) {
      showToast('error', 'Fill in Title and Link URL first')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await apiClient.post('/hero-section/upload-image?type=category', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (!res.data.success) throw new Error(res.data.message || 'Upload failed')

      const updated = {
        ...heroData,
        categories: [
          ...heroData.categories,
          {
            imageUrl: res.data.data.imageUrl,
            publicId: res.data.data.publicId || '',
            title:   newCat.title,
            link:    newCat.link,
            altText: newCat.altText || newCat.title,
            isActive: true,
            order:   heroData.categories.length,
          },
        ],
      }
      setHeroData(updated)
      setNewCat({ title: '', link: '', altText: '' })
      await persist(updated)
      showToast('success', 'Category added')
    } catch (err) {
      showToast('error', err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  /* Saves a single field for both arrays (banner) or just categories */
  const saveField = async (section, index, field, value) => {
    if (section === 'banner') {
      const updated = {
        ...heroData,
        desktopBackgroundImages: heroData.desktopBackgroundImages.map((item, i) => i === index ? { ...item, [field]: value } : item),
        mobileBackgroundImages:  heroData.mobileBackgroundImages.map((item, i)  => i === index ? { ...item, [field]: value } : item),
      }
      setHeroData(updated)
      await persist(updated)
    } else {
      const updated = {
        ...heroData,
        categories: heroData.categories.map((item, i) => i === index ? { ...item, [field]: value } : item),
      }
      setHeroData(updated)
      await persist(updated)
    }
  }

  const handleToggle = (section, index) => {
    if (section === 'banner') {
      const updated = {
        ...heroData,
        desktopBackgroundImages: heroData.desktopBackgroundImages.map((item, i) => i === index ? { ...item, isActive: !item.isActive } : item),
        mobileBackgroundImages:  heroData.mobileBackgroundImages.map((item, i)  => i === index ? { ...item, isActive: !item.isActive } : item),
      }
      setHeroData(updated)
      persist(updated)
    } else {
      const updated = {
        ...heroData,
        categories: heroData.categories.map((item, i) => i === index ? { ...item, isActive: !item.isActive } : item),
      }
      setHeroData(updated)
      persist(updated)
    }
  }

  const handleDelete = (section, index) => {
    if (!window.confirm('Delete this item?')) return
    if (section === 'banner') {
      const updated = {
        ...heroData,
        desktopBackgroundImages: heroData.desktopBackgroundImages.filter((_, i) => i !== index),
        mobileBackgroundImages:  heroData.mobileBackgroundImages.filter((_, i)  => i !== index),
      }
      setHeroData(updated)
      persist(updated).then(() => showToast('success', 'Banner deleted'))
    } else {
      const updated = { ...heroData, categories: heroData.categories.filter((_, i) => i !== index) }
      setHeroData(updated)
      persist(updated).then(() => showToast('success', 'Category deleted'))
    }
  }

  const handleReorder = (section, from, to) => {
    if (section === 'banner') {
      const reorder = (arr) => {
        const a = [...arr]; const [item] = a.splice(from, 1); a.splice(to, 0, item)
        return a.map((x, i) => ({ ...x, order: i }))
      }
      const updated = {
        ...heroData,
        desktopBackgroundImages: reorder(heroData.desktopBackgroundImages),
        mobileBackgroundImages:  reorder(heroData.mobileBackgroundImages),
      }
      setHeroData(updated); persist(updated)
    } else {
      const arr = [...heroData.categories]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
      const updated = { ...heroData, categories: arr.map((x, i) => ({ ...x, order: i })) }
      setHeroData(updated); persist(updated)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try { await apiClient.put('/hero-section', heroData); showToast('success', 'Settings saved') }
    catch { showToast('error', 'Failed to save settings') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  /* Use desktopBackgroundImages as the source of truth (synced to mobile) */
  const bannerImages = heroData.desktopBackgroundImages || []
  const categories   = heroData.categories || []

  const uploadBtnCls = (disabled) =>
    `flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
      disabled
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200 cursor-pointer'
    }`

  return (
    <div className="max-w-5xl space-y-6">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hero Section</h1>
        <p className="text-sm text-gray-500 mt-1">Upload banner images — same image shows on all devices automatically</p>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════ BANNER IMAGES TAB ═══════════════════════════ */}
      {activeTab === 'banners' && (
        <div className="space-y-5">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Banner Images</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Uploaded banners show on <strong>all devices</strong> — desktop, tablet, and mobile
              </p>
            </div>
            <label className={uploadBtnCls(uploading)}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload Banner'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={e => { if (e.target.files[0]) { handleBannerUpload(e.target.files[0]); e.target.value = '' } }}
              />
            </label>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold text-red-800">Recommended image size: 1600 × 600 px</p>
              <p className="text-red-600 mt-0.5">Use a wide banner image (landscape). Include your text and design in the image itself. It will be shown full-width on the website.</p>
            </div>
          </div>

          {/* Image grid */}
          {bannerImages.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-gray-700 font-bold text-lg mb-1">No banner images yet</p>
              <p className="text-gray-400 text-sm mb-5">Upload your first banner — it will appear on the home page slider</p>
              <label className={uploadBtnCls(uploading)}>
                <Upload className="w-4 h-4" />
                Upload First Banner
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={e => { if (e.target.files[0]) { handleBannerUpload(e.target.files[0]); e.target.value = '' } }} />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {bannerImages.map((img, i) => (
                <BannerCard key={img._id || i}
                  image={img} index={i} total={bannerImages.length}
                  onSaveField={(idx, f, v) => saveField('banner', idx, f, v)}
                  onToggle={(idx) => handleToggle('banner', idx)}
                  onDelete={(idx) => handleDelete('banner', idx)}
                  onMoveUp={(idx) => handleReorder('banner', idx, idx - 1)}
                  onMoveDown={(idx) => handleReorder('banner', idx, idx + 1)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ CATEGORIES TAB ══════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Category Cards</h2>
            <p className="text-sm text-gray-500 mt-0.5">Quick-link category images shown in the hero — click away from a field to save it</p>
          </div>

          {categories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <CategoryCard key={cat._id || i}
                  cat={cat} index={i} total={categories.length}
                  onSaveField={(idx, f, v) => saveField('category', idx, f, v)}
                  onToggle={(idx) => handleToggle('category', idx)}
                  onDelete={(idx) => handleDelete('category', idx)}
                  onMoveUp={(idx) => handleReorder('category', idx, idx - 1)}
                  onMoveDown={(idx) => handleReorder('category', idx, idx + 1)}
                />
              ))}
            </div>
          )}

          {/* Add new category form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-600" /> Add New Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Title *',            key: 'title',   ph: 'e.g. Kitchen Cleaning'      },
                { label: 'Link URL *',          key: 'link',    ph: '/window-solution/upholstery' },
                { label: 'Alt Text (optional)', key: 'altText', ph: 'Image description'           },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                  <input
                    type="text"
                    value={newCat[key]}
                    onChange={e => setNewCat(c => ({ ...c, [key]: e.target.value }))}
                    placeholder={ph}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50 transition-all"
                  />
                </div>
              ))}
            </div>
            <label className={uploadBtnCls(!newCat.title || !newCat.link || uploading)}>
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload & Add Category'}
              <input type="file" accept="image/*" className="hidden"
                disabled={!newCat.title || !newCat.link || uploading}
                onChange={e => { if (e.target.files[0]) { handleCategoryUpload(e.target.files[0]); e.target.value = '' } }} />
            </label>
            {(!newCat.title || !newCat.link) && (
              <p className="text-xs text-gray-400 mt-2">Fill in Title and Link URL first to enable upload</p>
            )}
          </div>
        </div>
      )}

      {/* ══════════ SETTINGS TAB ════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 max-w-lg">
          <h2 className="text-lg font-bold text-gray-900">Slider Settings</h2>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Auto-slide</label>
            <button
              type="button"
              onClick={() => setHeroData(d => ({ ...d, sliderSettings: { ...d.sliderSettings, autoSlide: !d.sliderSettings.autoSlide } }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                heroData.sliderSettings?.autoSlide
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {heroData.sliderSettings?.autoSlide ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              {heroData.sliderSettings?.autoSlide ? 'Auto-slide ON' : 'Auto-slide OFF'}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Slide Interval: <span className="text-red-600">{(heroData.sliderSettings?.slideInterval || 3000) / 1000}s</span>
            </label>
            <input
              type="range" min="1000" max="8000" step="500"
              value={heroData.sliderSettings?.slideInterval || 3000}
              onChange={e => setHeroData(d => ({ ...d, sliderSettings: { ...d.sliderSettings, slideInterval: Number(e.target.value) } }))}
              className="w-full accent-red-600"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1s (fast)</span><span>8s (slow)</span>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
