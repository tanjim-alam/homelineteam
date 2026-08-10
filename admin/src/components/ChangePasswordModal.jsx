import { useState } from 'react'
import { X, Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import apiClient from '../api/client'
import { useToast } from '../context/ToastContext'

export default function ChangePasswordModal({ onClose }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))
  const toggleShow = (key) => setShow(s => ({ ...s, [key]: !s[key] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return }
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return }

    setLoading(true)
    try {
      await apiClient.patch('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      showToast('success', 'Password changed successfully')
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">Change Password</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          {[
            { key: 'currentPassword', showKey: 'current', label: 'Current password', autoComplete: 'current-password' },
            { key: 'newPassword', showKey: 'next', label: 'New password', autoComplete: 'new-password', hint: 'Min. 6 characters' },
            { key: 'confirmPassword', showKey: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
          ].map(({ key, showKey, label, autoComplete, hint }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type={show[showKey] ? 'text' : 'password'}
                  autoComplete={autoComplete}
                  required
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={hint || '••••••••'}
                  className="w-full pl-9 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => toggleShow(showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {show[showKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-colors"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
