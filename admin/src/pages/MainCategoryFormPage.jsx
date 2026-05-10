import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../api/client'
import { ArrowLeft, Save, Layers, AlertTriangle } from 'lucide-react'

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')

export default function MainCategoryFormPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const location   = useLocation()
  const { showToast } = useToast()

  const isEditing = Boolean(id)
  const [form, setForm]   = useState({ name: '', slug: '' })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!isEditing) return

    const fromNav = location.state?.mainCategory
    if (fromNav) {
      setForm({ name: fromNav.name, slug: fromNav.slug })
      setLoading(false)
    } else {
      api.get('/main-categories')
        .then(({ data }) => {
          const mc = (Array.isArray(data?.data) ? data.data : []).find(m => m._id === id)
          if (mc) setForm({ name: mc.name, slug: mc.slug })
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const slug = form.slug || slugify(form.name)
    try {
      if (isEditing) {
        await api.put(`/main-categories/${id}`, { name: form.name, slug })
        showToast('success', 'Main category updated!')
      } else {
        await api.post('/main-categories', { name: form.name, slug })
        showToast('success', 'Main category created!')
      }
      navigate('/categories')
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save')
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
    <div className="max-w-lg">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button type="button" onClick={() => navigate('/categories')}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Main Category' : 'New Main Category'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Top-level navigation group for your products
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Layers className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Category Details</h2>
            <p className="text-xs text-gray-400">Name and URL slug</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
              Name <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onBlur={() => !form.slug && setForm(f => ({ ...f, slug: slugify(f.name) }))}
              placeholder="e.g., Window Solutions"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
              Slug <span className="text-red-500">*</span>
            </label>
            <input type="text" required value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="e.g., window-solutions"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all" />
            <p className="text-xs text-gray-400">Used in URLs — auto-generated from name</p>
          </div>

          {isEditing && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>Caution:</strong> Changing the slug will break existing URLs and may affect SEO. Update with care.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/categories')}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-7 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm">
              {saving
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : (isEditing ? 'Update Category' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
