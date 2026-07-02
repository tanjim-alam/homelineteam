import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import {
  UserCog, Plus, Trash2, X, Mail, Lock, User, Shield, Loader2, Eye, EyeOff,
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const ROLES = ['admin', 'manager', 'staff'];

const ROLE_CONFIG = {
  admin:   { label: 'Admin',   color: 'bg-purple-100 text-purple-700' },
  manager: { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
  staff:   { label: 'Staff',   color: 'bg-gray-100 text-gray-600' },
};

const PERMISSION_MODULES = [
  { key: 'categories',       label: 'Categories' },
  { key: 'products',         label: 'Products' },
  { key: 'interior-design',  label: 'Interior Design' },
  { key: 'delivery-partners',label: 'Delivery Partners' },
  { key: 'orders',           label: 'Orders' },
  { key: 'users',            label: 'Users' },
  { key: 'leads',            label: 'Leads' },
  { key: 'bookings',         label: 'Product Bookings' },
  { key: 'returns',          label: 'Returns & Exchanges' },
  { key: 'settings',         label: 'Settings' },
];

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const emptyForm = { name: '', email: '', password: '', role: 'staff', permissions: [], isActive: true };

export default function TeamPage() {
  const { showToast } = useToast();
  const currentUser = useSelector((s) => s.auth.user);

  const [team, setTeam]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null); // null = create, object = edit
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/team');
      setTeam(res.data?.data ?? []);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
      permissions: member.permissions || [],
      isActive: member.isActive,
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const togglePermission = (key) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const payload = {
          name: form.name,
          role: form.role,
          permissions: form.permissions,
          isActive: form.isActive,
        };
        if (form.password) payload.password = form.password;
        const res = await api.patch(`/team/${editing._id}`, payload);
        setTeam(prev => prev.map(m => m._id === editing._id ? res.data.data : m));
        showToast('success', 'Team member updated');
      } else {
        const res = await api.post('/team', form);
        setTeam(prev => [res.data.data, ...prev]);
        showToast('success', 'Team member added');
      }
      setModalOpen(false);
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from the team?`)) return;
    setDeletingId(member._id);
    try {
      await api.delete(`/team/${member._id}`);
      setTeam(prev => prev.filter(m => m._id !== member._id));
      showToast('success', 'Team member removed');
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Failed to remove team member');
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls = 'w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add team members and control which sections of the admin panel they can access.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading team…</span>
          </div>
        ) : team.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserCog className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No team members yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Access</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {team.map(m => {
                  const isSelf = currentUser?.id === m._id;
                  return (
                    <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials(m.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {m.name}{isSelf && <span className="text-gray-400 font-normal"> (you)</span>}
                            </div>
                            <div className="text-xs text-gray-400 truncate">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_CONFIG[m.role]?.color}`}>
                          {ROLE_CONFIG[m.role]?.label || m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.role === 'admin' ? (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-purple-500" /> Full access
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {m.permissions?.length ? `${m.permissions.length} module${m.permissions.length > 1 ? 's' : ''}` : 'No access'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {m.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(m.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(m)}
                            className="px-2.5 py-1.5 bg-gray-700 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMember(m)}
                            disabled={isSelf || deletingId === m._id}
                            title={isSelf ? "You can't remove your own account" : 'Remove'}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '30rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-bold text-gray-900">{editing ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name" className={inputCls}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email" required disabled={!!editing} value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="member@example.com"
                    className={`${inputCls} ${editing ? 'bg-gray-50 text-gray-500' : ''}`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {editing ? 'New password (optional)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editing}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={editing ? 'Leave blank to keep current password' : 'Min. 6 characters'}
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
                <div className="flex gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r} type="button"
                      onClick={() => setForm(f => ({ ...f, role: r }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        form.role === r ? ROLE_CONFIG[r].color + ' ring-2 ring-offset-1 ring-current' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {ROLE_CONFIG[r].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions — only for non-admin roles */}
              {form.role !== 'admin' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Page access</label>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-xl p-3">
                    {PERMISSION_MODULES.map(mod => (
                      <label key={mod.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(mod.key)}
                          onChange={() => togglePermission(mod.key)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {mod.label}
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 rounded-xl px-3 py-2.5 text-sm">
                  <Shield className="w-4 h-4 flex-shrink-0" /> Admins get full access to every page.
                </div>
              )}

              {/* Active toggle — only when editing */}
              {editing && (
                <label className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 cursor-pointer">
                  <span className="text-sm font-semibold text-gray-700">Account active</span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    disabled={currentUser?.id === editing._id}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              )}

              <button
                type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : editing ? 'Save changes' : 'Add team member'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
