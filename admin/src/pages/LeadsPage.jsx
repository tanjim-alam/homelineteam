import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone, MapPin, Home, Calendar, MessageSquare, Package,
  RefreshCw, Trash2, X, Eye, ChevronDown, User, Tag,
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';

const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  contacted: { label: 'Contacted', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  converted: { label: 'Converted', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  closed:    { label: 'Closed',    color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
};

const STATUSES = ['new', 'contacted', 'converted', 'closed'];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function LeadsPage() {
  const { showToast } = useToast();
  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [filter, setFilter]       = useState('all');
  const [viewLead, setViewLead]   = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      setLeads(res.data || []);
    } catch (e) {
      showToast('error', e.response?.data?.message || e.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/leads/${id}/status`, { status });
      setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
      if (viewLead?._id === id) setViewLead(v => ({ ...v, status }));
    } catch (e) {
      showToast('error', 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/leads/${id}`);
      setLeads(prev => prev.filter(l => l._id !== id));
      if (viewLead?._id === id) setViewLead(null);
      showToast('success', 'Lead deleted');
    } catch (e) {
      showToast('error', 'Failed to delete lead');
    } finally {
      setDeletingId(null);
    }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter(l => l.status === s).length;
    return acc;
  }, {});

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">All interior design inquiries from customers</p>
        </div>
        <button
          onClick={fetchLeads}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', count: leads.length, color: 'bg-gray-50 border-gray-200', text: 'text-gray-900' },
          { label: 'New',       count: counts.new,       color: 'bg-blue-50 border-blue-100',  text: 'text-blue-700' },
          { label: 'Contacted', count: counts.contacted, color: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
          { label: 'Converted', count: counts.converted, color: 'bg-green-50 border-green-100', text: 'text-green-700' },
          { label: 'Closed',    count: counts.closed,    color: 'bg-gray-50 border-gray-200',  text: 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.text}`}>{s.count ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-4 py-3 border-b border-gray-100">
          {['all', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? `All (${leads.length})` : `${STATUS_CONFIG[s].label} (${counts[s]})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading leads…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {filter === 'all' ? 'No leads yet.' : `No ${filter} leads.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(lead => (
                  <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                    {/* Lead name + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials(lead.name)}
                        </div>
                        <div className="max-w-[160px]">
                          <div className="text-sm font-semibold text-gray-900 truncate">{lead.name}</div>
                          {lead.productDetails?.name && (
                            <div className="text-xs text-gray-400 truncate">{lead.productDetails.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-3">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5" />{lead.phone}
                      </a>
                    </td>
                    {/* City + homeType */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {lead.city && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />{lead.city}
                          </div>
                        )}
                        {lead.homeType && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Home className="w-3 h-3 text-gray-400" />{lead.homeType}
                          </div>
                        )}
                        {!lead.city && !lead.homeType && <span className="text-xs text-gray-400">—</span>}
                      </div>
                    </td>
                    {/* Source */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium max-w-[120px] truncate">
                        {lead.sourcePage || 'Unknown'}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                        <Calendar className="w-3 h-3" />{formatDate(lead.createdAt)}
                      </div>
                    </td>
                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <select
                          value={lead.status || 'new'}
                          disabled={updatingId === lead._id}
                          onChange={e => updateStatus(lead._id, e.target.value)}
                          className={`appearance-none pr-6 pl-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors disabled:opacity-60 ${
                            STATUS_CONFIG[lead.status]?.color || STATUS_CONFIG.new.color
                          }`}
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewLead(lead)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => deleteLead(lead._id)}
                          disabled={deletingId === lead._id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* View Lead Modal */}
      {viewLead && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setViewLead(null); }}
        >
          <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '40rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  {initials(viewLead.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{viewLead.name}</h3>
                  <p className="text-xs text-gray-400">{formatDateTime(viewLead.createdAt)}</p>
                </div>
              </div>
              <button onClick={() => setViewLead(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status selector */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <div className="flex gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewLead._id, s)}
                      disabled={updatingId === viewLead._id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        viewLead.status === s
                          ? `${STATUS_CONFIG[s].color} ring-2 ring-offset-1 ring-current`
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-gray-900">Contact Information</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {[
                    { label: 'Phone',     value: viewLead.phone,    link: `tel:${viewLead.phone}` },
                    { label: 'City',      value: viewLead.city },
                    { label: 'Home Type', value: viewLead.homeType },
                    { label: 'Source',    value: viewLead.sourcePage },
                  ].map(row => row.value ? (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">{row.label}</span>
                      {row.link
                        ? <a href={row.link} className="font-semibold text-blue-600 hover:underline">{row.value}</a>
                        : <span className="font-semibold text-gray-900">{row.value}</span>
                      }
                    </div>
                  ) : null)}
                  {viewLead.message && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">Message</p>
                      <p className="text-sm text-gray-700">{viewLead.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              {viewLead.productDetails?.name && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-gray-900">Product Details</h4>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      {viewLead.productDetails.image && (
                        <img
                          src={viewLead.productDetails.image}
                          alt=""
                          className="w-20 h-16 object-cover rounded-lg border border-purple-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-bold text-gray-900">{viewLead.productDetails.name}</p>
                        {viewLead.productDetails.price > 0 && (
                          <p className="text-base font-bold text-green-600">₹{Number(viewLead.productDetails.price).toLocaleString()}</p>
                        )}
                        {viewLead.productDetails.category && (
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">{viewLead.productDetails.category}</span>
                        )}
                      </div>
                    </div>
                    {[
                      { label: 'Layout',    value: viewLead.productDetails.layout },
                      { label: 'Materials', value: viewLead.productDetails.materials },
                    ].map(row => row.value && row.value !== 'Not specified' ? (
                      <div key={row.label} className="flex items-center justify-between text-sm border-t border-purple-100 pt-2">
                        <span className="text-gray-500 font-medium">{row.label}</span>
                        <span className="font-semibold text-gray-900">{row.value}</span>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* Meta / Selected Product from meta */}
              {viewLead.meta?.selectedProduct && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-bold text-gray-900">Selected Configuration</h4>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                    {[
                      { label: 'Product',       value: viewLead.meta.selectedProduct.name },
                      { label: 'Price',         value: viewLead.meta.selectedProduct.basePrice ? `₹${Number(viewLead.meta.selectedProduct.basePrice).toLocaleString()}` : null },
                      { label: 'Kitchen Layout',value: viewLead.meta.selectedProduct.kitchenLayout },
                      { label: 'Wardrobe 1',    value: viewLead.meta.selectedProduct.wardrobe1Type },
                      { label: 'Wardrobe 2',    value: viewLead.meta.selectedProduct.wardrobe2Type },
                      { label: 'Layout',        value: viewLead.meta.selectedProduct.layout?.name || viewLead.meta.selectedProduct.layout },
                    ].map(row => row.value && row.value !== 'Not specified' ? (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 font-medium">{row.label}</span>
                        <span className="font-semibold text-gray-900 capitalize">{row.value}</span>
                      </div>
                    ) : null)}
                    {viewLead.meta.selectedProduct.image && (
                      <div className="pt-2 border-t border-indigo-100">
                        <img src={viewLead.meta.selectedProduct.image} alt="" className="w-24 h-16 object-cover rounded-lg border border-indigo-200" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Calculator Meta */}
              {viewLead.meta?.calculatorData && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-bold text-gray-900">Calculator Data</h4>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 space-y-2">
                    {Object.entries(viewLead.meta.calculatorData).map(([k, v]) =>
                      v != null ? (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-semibold text-gray-900">{String(v)}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <a
                  href={`tel:${viewLead.phone}`}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </a>
                <button
                  onClick={() => deleteLead(viewLead._id)}
                  disabled={deletingId === viewLead._id}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  onClick={() => setViewLead(null)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
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
