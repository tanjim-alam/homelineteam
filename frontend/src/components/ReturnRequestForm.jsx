'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiService from '../services/api';
import {
    ArrowLeft, Package, RefreshCw, AlertCircle, CheckCircle,
    X, Plus, Minus, RotateCcw, Info
} from 'lucide-react';

const RETURN_REASONS = [
    { value: 'defective', label: 'Defective Product' },
    { value: 'wrong_item', label: 'Wrong Item Received' },
    { value: 'not_as_described', label: 'Not as Described' },
    { value: 'damaged_shipping', label: 'Damaged During Shipping' },
    { value: 'changed_mind', label: 'Changed Mind' },
    { value: 'wrong_size', label: 'Wrong Size' },
    { value: 'quality_issue', label: 'Quality Issue' },
    { value: 'other', label: 'Other' },
];

const ITEM_CONDITIONS = [
    { value: 'new', label: 'New (Unused)' },
    { value: 'used', label: 'Used (Good Condition)' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'defective', label: 'Defective' },
];

const inputCls = 'w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

const ReturnRequestForm = ({ order, onClose, onSuccess }) => {
    const router = useRouter();

    const [type, setType] = useState('return');
    const [selectedItems, setSelectedItems] = useState({});
    const [customerNotes, setCustomerNotes] = useState('');
    const [exchangeNotes, setExchangeNotes] = useState('');
    const [bankAccount, setBankAccount] = useState({
        accountHolderName: '', accountNumber: '', bankName: '',
        ifscCode: '', branchName: '', accountType: 'savings'
    });
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '', phone: '', address: '', city: '', state: '',
        zipCode: '', country: 'India', landmark: '', addressType: 'home'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Auto-select all items on mount
    useEffect(() => {
        if (!order) return;
        const init = {};
        order.items.forEach(item => {
            const id = (item.productId?._id || item.productId || '').toString();
            init[id] = { quantity: item.quantity, reason: 'changed_mind', condition: 'new' };
        });
        setSelectedItems(init);

        if (order.shippingAddress) {
            setShippingAddress({
                fullName: order.shippingAddress.fullName || order.customer?.name || '',
                phone: order.shippingAddress.phone || order.customer?.phone || '',
                address: order.shippingAddress.address || order.customer?.address || '',
                city: order.shippingAddress.city || order.customer?.city || '',
                state: order.shippingAddress.state || order.customer?.state || '',
                zipCode: order.shippingAddress.zipCode || order.customer?.pincode || '',
                country: 'India',
                landmark: order.shippingAddress.landmark || '',
                addressType: 'home'
            });
        }
    }, [order]);

    const getItemId = (item) => (item.productId?._id || item.productId || '').toString();

    const updateItem = (id, patch) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: { ...prev[id], ...patch }
        }));
    };

    const removeItem = (id) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const addItem = (item) => {
        const id = getItemId(item);
        if (selectedItems[id]) return; // already in
        setSelectedItems(prev => ({
            ...prev,
            [id]: { quantity: 1, reason: 'changed_mind', condition: 'new' }
        }));
    };

    const selectedCount = Object.values(selectedItems).filter(i => i.quantity > 0).length;
    const totalRefund = Object.entries(selectedItems).reduce((sum, [id, sel]) => {
        const item = order?.items.find(i => getItemId(i) === id);
        return sum + (item ? item.price * sel.quantity : 0);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate items
        const activeItems = Object.entries(selectedItems).filter(([_, d]) => d.quantity > 0);
        if (activeItems.length === 0) {
            setError('Please select at least one item to return.');
            return;
        }

        // Validate all have reasons
        const missingReason = activeItems.filter(([_, d]) => !d.reason);
        if (missingReason.length > 0) {
            setError('Please select a return reason for every item.');
            return;
        }

        // Validate bank account for returns
        if (type === 'return') {
            const { accountHolderName, accountNumber, bankName, ifscCode } = bankAccount;
            if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
                setError('Please fill in all required bank account details.');
                return;
            }
        }

        // Validate shipping address for returns
        if (type === 'return') {
            const { fullName, phone, address, city, state, zipCode } = shippingAddress;
            if (!fullName || !phone || !address || !city || !state || !zipCode) {
                setError('Please fill in all required shipping address fields.');
                return;
            }
        }

        setLoading(true);
        try {
            const items = activeItems.map(([id, sel]) => ({
                productId: id,
                quantity: sel.quantity,
                reason: sel.reason,
                condition: sel.condition,
            }));

            const notesText = [
                customerNotes,
                type === 'exchange' && exchangeNotes ? `Exchange request: ${exchangeNotes}` : ''
            ].filter(Boolean).join('\n\n');

            const payload = {
                orderId: order._id,
                type,
                items,
                exchangeItems: [],
                customerNotes: notesText,
                images: [],
                bankAccount: type === 'return' ? bankAccount : {},
                shippingAddress: type === 'return' ? shippingAddress : {}
            };

            const response = await apiService.createReturnRequest(payload);

            if (response.success) {
                setSuccess('Request submitted successfully! Redirecting…');
                setTimeout(() => onSuccess?.(response.data), 1500);
            } else {
                setError(response.message || 'Failed to submit request. Please try again.');
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-primary text-white">
                <div className="container-custom py-8">
                    <button onClick={onClose} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
                        <ArrowLeft className="w-4 h-4" /> Back to Orders
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <RotateCcw className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Request Return / Exchange</h1>
                            <p className="text-white/70 text-sm mt-0.5">
                                Order #{order.orderNumber || order._id?.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="container-custom py-8 max-w-3xl space-y-6">

                {/* Error / Success */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <p className="text-green-700 text-sm font-medium">{success}</p>
                    </div>
                )}

                {/* Step 1 — Type */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-4">Step 1 — What would you like to do?</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { val: 'return',   icon: RotateCcw, title: 'Return for Refund',      sub: 'Get your money back' },
                            { val: 'exchange', icon: RefreshCw, title: 'Exchange',                sub: 'Replace with other items' },
                        ].map(({ val, icon: Icon, title, sub }) => (
                            <label key={val} className="cursor-pointer">
                                <input type="radio" name="type" value={val} checked={type === val} onChange={() => setType(val)} className="sr-only" />
                                <div className={`p-4 rounded-xl border-2 transition-all ${type === val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <Icon className={`w-6 h-6 mb-2 ${type === val ? 'text-blue-600' : 'text-gray-500'}`} />
                                    <p className={`font-bold text-sm ${type === val ? 'text-blue-900' : 'text-gray-800'}`}>{title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Step 2 — Items */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Step 2 — Select Items</h2>
                    <p className="text-sm text-gray-500 mb-4">All items are pre-selected. Remove any you don't want to return.</p>

                    <div className="space-y-4">
                        {order.items.map((item) => {
                            const id = getItemId(item);
                            const sel = selectedItems[id];
                            const isSelected = !!sel && sel.quantity > 0;

                            return (
                                <div key={id} className={`rounded-xl border-2 p-4 transition-all ${isSelected ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                    <div className="flex items-start gap-4">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-gray-900 text-sm leading-snug">{item.name}</p>
                                                {isSelected ? (
                                                    <button type="button" onClick={() => removeItem(id)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button type="button" onClick={() => addItem(item)} className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shrink-0">
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">₹{item.price} × {item.quantity} available</p>

                                            {isSelected && (
                                                <div className="mt-3 space-y-3">
                                                    {/* Quantity */}
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-semibold text-gray-600 w-16 shrink-0">Quantity</span>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => {
                                                                if (sel.quantity > 1) updateItem(id, { quantity: sel.quantity - 1 });
                                                                else removeItem(id);
                                                            }} className="w-7 h-7 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
                                                                <Minus className="w-3 h-3 text-gray-600" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-bold text-gray-900">{sel.quantity}</span>
                                                            <button type="button" onClick={() => {
                                                                if (sel.quantity < item.quantity) updateItem(id, { quantity: sel.quantity + 1 });
                                                            }} className="w-7 h-7 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50">
                                                                <Plus className="w-3 h-3 text-gray-600" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Reason + Condition */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Reason *</label>
                                                            <select
                                                                value={sel.reason}
                                                                onChange={e => updateItem(id, { reason: e.target.value })}
                                                                className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                                                required
                                                            >
                                                                <option value="">Select reason…</option>
                                                                {RETURN_REASONS.map(r => (
                                                                    <option key={r.value} value={r.value}>{r.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-semibold text-gray-600 block mb-1">Condition</label>
                                                            <select
                                                                value={sel.condition}
                                                                onChange={e => updateItem(id, { condition: e.target.value })}
                                                                className="w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                                            >
                                                                {ITEM_CONDITIONS.map(c => (
                                                                    <option key={c.value} value={c.value}>{c.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary bar */}
                    {selectedCount > 0 && (
                        <div className="mt-4 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                            <p className="text-sm font-semibold text-blue-800">{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected</p>
                            {type === 'return' && (
                                <p className="text-sm font-bold text-blue-700">Estimated refund: ₹{totalRefund.toLocaleString()}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Step 3 — Exchange note (only for exchange) */}
                {type === 'exchange' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-1">Step 3 — Exchange Details</h2>
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-800">Our team will contact you to arrange the exchange. Please describe what you'd like to exchange for below.</p>
                        </div>
                        <label className={labelCls}>What would you like instead? *</label>
                        <textarea
                            value={exchangeNotes}
                            onChange={e => setExchangeNotes(e.target.value)}
                            placeholder="E.g. Same item in larger size, or a different colour — anything you'd prefer…"
                            rows={4}
                            required={type === 'exchange'}
                            className={inputCls + ' resize-none'}
                        />
                    </div>
                )}

                {/* Bank account — only for return */}
                {type === 'return' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-1">Bank Account for Refund</h2>
                        <p className="text-sm text-gray-500 mb-4">We'll transfer the refund to this account.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'accountHolderName', label: 'Account Holder Name *', placeholder: 'Full name as on bank account', type: 'text' },
                                { key: 'bankName',           label: 'Bank Name *',            placeholder: 'e.g. HDFC Bank',             type: 'text' },
                                { key: 'accountNumber',      label: 'Account Number *',        placeholder: 'Enter account number',        type: 'text' },
                                { key: 'ifscCode',           label: 'IFSC Code *',             placeholder: 'e.g. HDFC0001234',            type: 'text' },
                                { key: 'branchName',         label: 'Branch Name',             placeholder: 'Branch (optional)',           type: 'text' },
                            ].map(({ key, label, placeholder, type: itype }) => (
                                <div key={key}>
                                    <label className={labelCls}>{label}</label>
                                    <input
                                        type={itype}
                                        value={bankAccount[key]}
                                        onChange={e => setBankAccount(p => ({ ...p, [key]: key === 'ifscCode' ? e.target.value.toUpperCase() : e.target.value }))}
                                        placeholder={placeholder}
                                        className={inputCls + (key === 'accountNumber' || key === 'ifscCode' ? ' font-mono' : '')}
                                        required={label.endsWith('*')}
                                    />
                                </div>
                            ))}
                            <div>
                                <label className={labelCls}>Account Type *</label>
                                <select value={bankAccount.accountType} onChange={e => setBankAccount(p => ({ ...p, accountType: e.target.value }))} className={inputCls} required>
                                    <option value="savings">Savings</option>
                                    <option value="current">Current</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shipping address — only for return */}
                {type === 'return' && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h2 className="text-base font-bold text-gray-900 mb-1">Pickup Address</h2>
                        <p className="text-sm text-gray-500 mb-4">Where should we collect the items from?</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key: 'fullName', label: 'Full Name *',      placeholder: 'Your full name',   type: 'text',     span: false },
                                { key: 'phone',    label: 'Phone *',           placeholder: '10-digit mobile',  type: 'tel',      span: false },
                                { key: 'address',  label: 'Address *',         placeholder: 'House / street…',  type: 'textarea', span: true  },
                                { key: 'city',     label: 'City *',            placeholder: 'City',             type: 'text',     span: false },
                                { key: 'state',    label: 'State *',           placeholder: 'State',            type: 'text',     span: false },
                                { key: 'zipCode',  label: 'PIN Code *',        placeholder: '6-digit PIN',      type: 'text',     span: false },
                                { key: 'landmark', label: 'Landmark',          placeholder: 'Nearby landmark',  type: 'text',     span: false },
                            ].map(({ key, label, placeholder, type: itype, span }) => (
                                <div key={key} className={span ? 'md:col-span-2' : ''}>
                                    <label className={labelCls}>{label}</label>
                                    {itype === 'textarea' ? (
                                        <textarea
                                            value={shippingAddress[key]}
                                            onChange={e => setShippingAddress(p => ({ ...p, [key]: e.target.value }))}
                                            placeholder={placeholder}
                                            rows={2}
                                            className={inputCls + ' resize-none'}
                                            required={label.endsWith('*')}
                                        />
                                    ) : (
                                        <input
                                            type={itype}
                                            value={shippingAddress[key]}
                                            onChange={e => setShippingAddress(p => ({ ...p, [key]: e.target.value }))}
                                            placeholder={placeholder}
                                            className={inputCls}
                                            required={label.endsWith('*')}
                                        />
                                    )}
                                </div>
                            ))}
                            <div>
                                <label className={labelCls}>Address Type</label>
                                <select value={shippingAddress.addressType} onChange={e => setShippingAddress(p => ({ ...p, addressType: e.target.value }))} className={inputCls}>
                                    <option value="home">Home</option>
                                    <option value="office">Office</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Notes */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">Additional Notes</h2>
                    <p className="text-sm text-gray-500 mb-3">Anything else we should know about your request?</p>
                    <textarea
                        value={customerNotes}
                        onChange={e => setCustomerNotes(e.target.value)}
                        placeholder="Optional — add any extra details here…"
                        rows={3}
                        className={inputCls + ' resize-none'}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 pb-8">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || selectedCount === 0}
                        className="btn-primary px-8 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Submitting…</>
                        ) : (
                            <><RotateCcw className="w-4 h-4" />Submit {type === 'exchange' ? 'Exchange' : 'Return'} Request</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReturnRequestForm;
