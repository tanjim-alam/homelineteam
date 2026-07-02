import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone, MapPin, Calendar, Package,
  RefreshCw, Trash2, X, Eye, ChevronDown, ShoppingBag, FileText, ExternalLink,
} from 'lucide-react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { config } from '../config/config';

const FRONTEND_URL = config.FRONTEND_BASE_URL || 'https://homelineteam.com';

const STATUS_CONFIG = {
  new:       { label: 'New',        color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  contacted: { label: 'Contacted',  color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  converted: { label: 'Confirmed',  color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  closed:    { label: 'Cancelled',  color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
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
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

export default function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [filter, setFilter]           = useState('all');
  const [viewBooking, setViewBooking] = useState(null);
  const [updatingId, setUpdatingId]   = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads/bookings');
      const payload = res.data;
      setBookings(Array.isArray(payload) ? payload : (payload?.data ?? []));
    } catch (e) {
      showToast('error', e.response?.data?.message || e.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/leads/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      if (viewBooking?._id === id) setViewBooking(v => ({ ...v, status }));
    } catch {
      showToast('error', 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/leads/${id}`);
      setBookings(prev => prev.filter(b => b._id !== id));
      if (viewBooking?._id === id) setViewBooking(null);
      showToast('success', 'Booking deleted');
    } catch {
      showToast('error', 'Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length;
    return acc;
  }, {});

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customers who booked products directly from the product page</p>
        </div>
        <button
          onClick={fetchBookings}
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
          { label: 'Total',     count: bookings.length,   color: 'bg-gray-50 border-gray-200',   text: 'text-gray-900' },
          { label: 'New',       count: counts.new,        color: 'bg-blue-50 border-blue-100',   text: 'text-blue-700' },
          { label: 'Contacted', count: counts.contacted,  color: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
          { label: 'Confirmed', count: counts.converted,  color: 'bg-green-50 border-green-100', text: 'text-green-700' },
          { label: 'Cancelled', count: counts.closed,     color: 'bg-gray-50 border-gray-200',   text: 'text-gray-500' },
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
                filter === s ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s === 'all'
                ? `All (${bookings.length})`
                : `${STATUS_CONFIG[s].label} (${counts[s]})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading bookings…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {filter === 'all' ? 'No bookings yet.' : `No ${STATUS_CONFIG[filter]?.label.toLowerCase()} bookings.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    {/* Customer */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials(b.name)}
                        </div>
                        <div className="max-w-[140px]">
                          <div className="text-sm font-semibold text-gray-900 truncate">{b.name}</div>
                          {b.city && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="w-3 h-3" />{b.city}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-3 py-3">
                      <a href={`tel:${b.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium whitespace-nowrap">
                        <Phone className="w-3.5 h-3.5" />{b.phone}
                      </a>
                    </td>
                    {/* Product */}
                    <td className="px-3 py-3 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        {b.productDetails?.image && (
                          <img src={b.productDetails.image} alt="" className="w-10 h-8 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate" title={b.productDetails?.name}>
                            {b.productDetails?.name
                              ? b.productDetails.name.length > 28
                                ? b.productDetails.name.slice(0, 28) + '…'
                                : b.productDetails.name
                              : '—'}
                          </div>
                          {b.productDetails?.category && (
                            <span className="text-xs text-gray-400 mt-0.5 block">{b.productDetails.category}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Price */}
                    <td className="px-3 py-3">
                      {b.productDetails?.price
                        ? <span className="text-sm font-bold text-green-600">₹{Number(b.productDetails.price).toLocaleString('en-IN')}</span>
                        : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    {/* Date */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                        <Calendar className="w-3 h-3" />{formatDate(b.createdAt)}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3">
                      <div className="relative">
                        <select
                          value={b.status || 'new'}
                          disabled={updatingId === b._id}
                          onChange={e => updateStatus(b._id, e.target.value)}
                          className={`appearance-none pr-6 pl-2 py-1 rounded-lg text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors disabled:opacity-60 ${
                            STATUS_CONFIG[b.status]?.color || STATUS_CONFIG.new.color
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
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewBooking(b)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-semibold hover:bg-gray-600 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => deleteBooking(b._id)}
                          disabled={deletingId === b._id}
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

      {/* View Booking Modal */}
      {viewBooking && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setViewBooking(null); }}
        >
          <div style={{ background: '#fff', borderRadius: '1rem', width: '100%', maxWidth: '38rem', maxHeight: '90vh', overflowY: 'auto' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  {initials(viewBooking.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{viewBooking.name}</h3>
                  <p className="text-xs text-gray-400">{formatDateTime(viewBooking.createdAt)}</p>
                </div>
              </div>
              <button onClick={() => setViewBooking(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status selector */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Booking Status</span>
                <div className="flex gap-2 flex-wrap">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewBooking._id, s)}
                      disabled={updatingId === viewBooking._id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        viewBooking.status === s
                          ? `${STATUS_CONFIG[s].color} ring-2 ring-offset-1 ring-current`
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booked Product */}
              {viewBooking.productDetails?.name && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-gray-900">Booked Product</h4>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      {viewBooking.productDetails.image && (
                        <img
                          src={viewBooking.productDetails.image}
                          alt=""
                          className="w-24 h-18 object-cover rounded-lg border border-blue-200 flex-shrink-0"
                          style={{ height: '72px' }}
                        />
                      )}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{viewBooking.productDetails.name}</p>
                        {viewBooking.productDetails.price > 0 && (
                          <p className="text-lg font-bold text-green-600">₹{Number(viewBooking.productDetails.price).toLocaleString('en-IN')}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          {viewBooking.productDetails.category && (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {viewBooking.productDetails.category}
                            </span>
                          )}
                          {viewBooking.sourcePage && (
                            <a
                              href={`${FRONTEND_URL}${viewBooking.sourcePage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" /> View Live
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-bold text-gray-900">Customer Details</h4>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {[
                    { label: 'Phone', value: viewBooking.phone, link: `tel:${viewBooking.phone}` },
                    { label: 'City',  value: viewBooking.city },
                  ].map(r => r.value ? (
                    <div key={r.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">{r.label}</span>
                      {r.link
                        ? <a href={r.link} className="font-semibold text-blue-600 hover:underline">{r.value}</a>
                        : <span className="font-semibold text-gray-900">{r.value}</span>}
                    </div>
                  ) : null)}
                  {viewBooking.meta?.address && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        <p className="text-xs text-gray-500 font-medium">Delivery Address</p>
                      </div>
                      <p className="text-sm text-gray-700">{viewBooking.meta.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <a
                  href={`tel:${viewBooking.phone}`}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call Customer
                </a>
                <button
                  onClick={() => deleteBooking(viewBooking._id)}
                  disabled={deletingId === viewBooking._id}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  onClick={() => setViewBooking(null)}
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
