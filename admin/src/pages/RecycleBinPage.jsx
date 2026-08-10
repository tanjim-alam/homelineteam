import { useState, useEffect, useMemo } from 'react';
import {
  Trash2, RotateCcw, AlertTriangle, Search, Clock, X, Image as ImageIcon,
} from 'lucide-react';
import apiClient from '../api/client';
import { useToast } from '../context/ToastContext';

const daysUntil = (date) => {
  const ms = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export default function RecycleBinPage() {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [retentionDays, setRetentionDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [busyKey, setBusyKey] = useState(null); // `${type}:${id}` of the row currently acting
  const { showToast } = useToast();

  const fetchTrash = async (retriesLeft = 2) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/trash');
      const data = res?.data ?? res;
      setItems(Array.isArray(data?.data) ? data.data : []);
      setCounts(data?.counts || {});
      setRetentionDays(data?.retentionDays || 30);
      setFetchError(false);
      setLoading(false);
    } catch (err) {
      if (retriesLeft > 0 && err?.response?.status !== 401 && err?.response?.status !== 403) {
        setTimeout(() => fetchTrash(retriesLeft - 1), 1200);
        return;
      }
      setFetchError(true);
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, []);

  const typeOptions = useMemo(() => {
    const seen = new Map();
    items.forEach(i => { if (!seen.has(i.type)) seen.set(i.type, i.typeLabel); });
    return Array.from(seen.entries()).map(([type, label]) => ({ type, label, count: counts[type] || 0 }));
  }, [items, counts]);

  const filtered = items.filter(i => {
    if (activeType !== 'all' && i.type !== activeType) return false;
    if (searchQuery && !`${i.title} ${i.subtitle}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalCount = items.length;

  const handleRestore = async (item) => {
    const key = `${item.type}:${item.id}`;
    setBusyKey(key);
    try {
      await apiClient.post(`/trash/${item.type}/${item.id}/restore`);
      showToast('success', `${item.typeLabel} restored`);
      setItems(prev => prev.filter(i => !(i.type === item.type && i.id === item.id)));
    } catch (err) {
      showToast('error', err.response?.data?.message || `Failed to restore ${item.typeLabel.toLowerCase()}`);
    } finally { setBusyKey(null); }
  };

  const handleDeleteForever = async (item) => {
    if (!confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) return;
    const key = `${item.type}:${item.id}`;
    setBusyKey(key);
    try {
      await apiClient.delete(`/trash/${item.type}/${item.id}`);
      showToast('success', `${item.typeLabel} permanently deleted`);
      setItems(prev => prev.filter(i => !(i.type === item.type && i.id === item.id)));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete item');
    } finally { setBusyKey(null); }
  };

  const handleEmpty = async () => {
    const scopeLabel = activeType === 'all' ? 'the entire Recycle Bin' : `all ${typeOptions.find(t => t.type === activeType)?.label || ''} items`;
    if (!confirm(`Permanently delete ${scopeLabel}? This cannot be undone.`)) return;
    try {
      const qs = activeType === 'all' ? '' : `?type=${activeType}`;
      await apiClient.delete(`/trash/empty${qs}`);
      showToast('success', 'Recycle Bin emptied');
      fetchTrash();
    } catch {
      showToast('error', 'Failed to empty Recycle Bin');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-gray-400" /> Recycle Bin
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Deleted items stay here for {retentionDays} days before being permanently removed.
          </p>
        </div>
        {totalCount > 0 && (
          <button
            onClick={handleEmpty}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            {activeType === 'all' ? 'Empty Recycle Bin' : `Empty "${typeOptions.find(t => t.type === activeType)?.label}"`}
          </button>
        )}
      </div>

      {/* Search + filters */}
      {totalCount > 0 && (
        <div className="space-y-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search deleted items..."
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveType('all')}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                activeType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({totalCount})
            </button>
            {typeOptions.map(t => (
              <button
                key={t.type}
                onClick={() => setActiveType(t.type)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeType === t.type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-700 font-bold text-lg mb-1">Couldn't load the Recycle Bin</p>
          <p className="text-gray-400 text-sm mb-6">The server didn't respond in time.</p>
          <button onClick={() => fetchTrash()} className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">
            Retry
          </button>
        </div>
      ) : totalCount === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-700 font-bold text-lg mb-1">Recycle Bin is empty</p>
          <p className="text-gray-400 text-sm">Deleted products, categories and other items will show up here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <p className="text-gray-700 font-bold mb-1">No matching items</p>
          <p className="text-gray-400 text-sm">Try a different search term or filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {filtered.map(item => {
            const key = `${item.type}:${item.id}`;
            const isBusy = busyKey === key;
            const remaining = daysUntil(item.purgeAt);
            const urgent = remaining <= 5;
            return (
              <div key={key} className="flex items-center gap-4 p-4 sm:p-5">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.title}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {item.typeLabel}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs truncate mt-0.5">{item.subtitle}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="text-gray-400">Deleted {timeAgo(item.deletedAt)}</span>
                    <span className={`flex items-center gap-1 font-semibold ${urgent ? 'text-red-500' : 'text-gray-400'}`}>
                      <Clock className="w-3 h-3" />
                      {remaining === 0 ? 'Purges today' : `Purges in ${remaining}d`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => handleDeleteForever(item)}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
