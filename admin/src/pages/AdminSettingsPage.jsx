import { useState, useEffect } from 'react'
import { Save, Mail, ShoppingCart, RefreshCw, Users } from 'lucide-react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'

const DEFAULT_EMAIL = 'homeline042@gmail.com'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    orderNotificationEmail: '',
    returnNotificationEmail: '',
    leadNotificationEmail: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    apiClient.get('/settings')
      .then(res => {
        const s = res.data.settings || {}
        setForm({
          orderNotificationEmail: s.orderNotificationEmail || DEFAULT_EMAIL,
          returnNotificationEmail: s.returnNotificationEmail || DEFAULT_EMAIL,
          leadNotificationEmail: s.leadNotificationEmail || DEFAULT_EMAIL,
        })
      })
      .catch(() => showToast('error', 'Failed to load settings'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await apiClient.put('/settings', form)
      showToast('success', 'Settings saved successfully')
    } catch {
      showToast('error', 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const emailFields = [
    {
      key: 'orderNotificationEmail',
      label: 'Order Notifications',
      description: 'Email address that receives alerts when a new order is placed',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      key: 'returnNotificationEmail',
      label: 'Return / Exchange Notifications',
      description: 'Email address that receives alerts when a customer submits a return or exchange request',
      icon: RefreshCw,
      color: 'red',
    },
    {
      key: 'leadNotificationEmail',
      label: 'Lead Notifications',
      description: 'Email address that receives alerts when a new interior design lead is submitted',
      icon: Users,
      color: 'green',
    },
  ]

  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', ring: 'focus:ring-blue-500 focus:border-blue-500' },
    red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', ring: 'focus:ring-red-500 focus:border-red-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', ring: 'focus:ring-green-500 focus:border-green-500' },
  }

  return (
    <div className="max-w-2xl">

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Email Notification Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure which email addresses receive admin notifications for each event type.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {emailFields.map(field => {
            const Icon = field.icon
            const c = colorMap[field.color]
            return (
              <div key={field.key} className={`rounded-xl border ${c.border} ${c.bg} p-5`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className={`mt-0.5 flex-shrink-0 ${c.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{field.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{field.description}</p>
                  </div>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder="admin@example.com"
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 ${c.ring}`}
                  />
                </div>
              </div>
            )
          })}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
