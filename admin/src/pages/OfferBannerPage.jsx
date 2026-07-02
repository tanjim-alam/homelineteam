import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Save, Tag, ToggleLeft, ToggleRight, Upload, Edit, X, Image } from 'lucide-react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'

const EMPTY_FORM = { text: '', link: '', backgroundColor: '#2563eb', textColor: '#ffffff', isActive: true, position: 'below-hero' }

const POSITIONS = [
  { value: 'below-hero',       label: 'Below Hero Section' },
  { value: 'below-categories', label: 'Below Categories Section' },
  { value: 'below-products',   label: 'Below Products Section' },
  { value: 'below-design',     label: 'Below Interior Design Section' },
  { value: 'all',              label: 'All Sections (everywhere)' },
]
const POSITION_LABEL = Object.fromEntries(POSITIONS.map(p => [p.value, p.label]))

export default function OfferBannerPage() {
  const { showToast } = useToast()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileRef = useRef()

  const fetchBanners = async () => {
    try {
      const res = await apiClient.get('/offer-banners')
      setBanners(res.data?.data || [])
    } catch {
      showToast('error', 'Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanners() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setShowForm(true)
  }

  const openEdit = (banner) => {
    setEditing(banner)
    setForm({
      text: banner.text || '',
      link: banner.link || '',
      backgroundColor: banner.backgroundColor || '#2563eb',
      textColor: banner.textColor || '#ffffff',
      isActive: banner.isActive !== false,
      position: banner.position || 'below-hero',
    })
    setImageFile(null)
    setImagePreview(banner.imageUrl || '')
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview('') }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('text', form.text)
      fd.append('link', form.link)
      fd.append('backgroundColor', form.backgroundColor)
      fd.append('textColor', form.textColor)
      fd.append('isActive', String(form.isActive))
      fd.append('position', form.position)
      if (imageFile) fd.append('image', imageFile)

      if (editing) {
        await apiClient.put(`/offer-banners/${editing._id}`, fd)
        showToast('success', 'Banner updated')
      } else {
        await apiClient.post('/offer-banners', fd)
        showToast('success', 'Banner created')
      }
      closeForm()
      fetchBanners()
    } catch {
      showToast('error', 'Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return
    try {
      await apiClient.delete(`/offer-banners/${id}`)
      fetchBanners()
      showToast('success', 'Banner deleted')
    } catch {
      showToast('error', 'Failed to delete banner')
    }
  }

  const handleToggle = async (banner) => {
    try {
      await apiClient.put(`/offer-banners/${banner._id}`, { ...banner, isActive: !banner.isActive })
      fetchBanners()
      showToast('success', banner.isActive ? 'Banner deactivated' : 'Banner activated')
    } catch {
      showToast('error', 'Failed to update banner')
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Offer Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage ad/promotional banners — place each one below the hero, categories, products section, or show it everywhere</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Banner' : 'New Banner'}</h2>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Banner Image (optional)</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                style={{ minHeight: 100 }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full object-cover max-h-48" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 gap-2 text-gray-400">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Click to upload image</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              {imagePreview && (
                <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }} className="text-xs text-red-500 mt-1">Remove image</button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Banner Text</label>
              <input
                type="text"
                value={form.text}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                placeholder="e.g. Free delivery on orders above ₹999"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL (optional)</label>
              <input
                type="text"
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="/collections"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Show On</label>
              <select
                value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {POSITIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">Choose where on the home page this banner appears.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.backgroundColor} onChange={e => setForm(f => ({ ...f, backgroundColor: e.target.value }))} className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
                  <span className="text-sm text-gray-500">{form.backgroundColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor} onChange={e => setForm(f => ({ ...f, textColor: e.target.value }))} className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
                  <span className="text-sm text-gray-500">{form.textColor}</span>
                </div>
              </div>
            </div>

            {/* Live preview */}
            {(form.text || imagePreview) && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
                <div className="rounded-lg overflow-hidden" style={{ backgroundColor: form.backgroundColor }}>
                  {imagePreview && <img src={imagePreview} alt="banner" className="w-full object-cover max-h-40" />}
                  {form.text && (
                    <div className="px-4 py-3 text-center text-sm font-semibold" style={{ color: form.textColor }}>
                      {form.text}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}>
                {form.isActive
                  ? <ToggleRight className="w-6 h-6 text-green-500" />
                  : <ToggleLeft className="w-6 h-6 text-gray-400" />}
              </button>
              <span className="text-sm text-gray-600">{form.isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : (editing ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No banners yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Add Banner" to create your first promotional banner</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(banner => (
            <div key={banner._id} className={`bg-white rounded-xl border p-4 ${banner.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-4">
                {/* Image or color preview */}
                <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden" style={{ backgroundColor: banner.backgroundColor }}>
                  {banner.imageUrl
                    ? <img src={banner.imageUrl} alt="banner" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-5 h-5 opacity-30" style={{ color: banner.textColor }} />
                      </div>
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{banner.text || '(no text)'}</p>
                  {banner.link && <p className="text-xs text-gray-400 truncate">{banner.link}</p>}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {POSITION_LABEL[banner.position] || banner.position || 'Below Hero Section'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(banner)} className={`${banner.isActive ? 'text-green-500' : 'text-gray-400'} hover:opacity-70`} title={banner.isActive ? 'Deactivate' : 'Activate'}>
                    {banner.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => openEdit(banner)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
