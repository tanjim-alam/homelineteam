'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/UserContext';
import apiService from '../services/api';
import {
    ArrowLeft,
    Package,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Upload,
    X,
    Plus,
    Minus
} from 'lucide-react';

const ReturnRequestForm = ({ order, onClose, onSuccess }) => {
    const { user } = useUser();
    const router = useRouter();

    const [formData, setFormData] = useState({
        type: 'return',
        items: [],
        exchangeItems: [],
        customerNotes: '',
        images: []
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedItems, setSelectedItems] = useState({});
    const [exchangeProducts, setExchangeProducts] = useState([]);
    const [showExchangeProducts, setShowExchangeProducts] = useState(false);

    const returnReasons = [
        { value: 'defective', label: 'Defective Product' },
        { value: 'wrong_item', label: 'Wrong Item Received' },
        { value: 'not_as_described', label: 'Not as Described' },
        { value: 'damaged_shipping', label: 'Damaged During Shipping' },
        { value: 'changed_mind', label: 'Changed Mind' },
        { value: 'wrong_size', label: 'Wrong Size' },
        { value: 'quality_issue', label: 'Quality Issue' },
        { value: 'other', label: 'Other' }
    ];

    const itemConditions = [
        { value: 'new', label: 'New (Unused)' },
        { value: 'used', label: 'Used (Good Condition)' },
        { value: 'damaged', label: 'Damaged' },
        { value: 'defective', label: 'Defective' }
    ];

    useEffect(() => {
        if (order) {
            // Initialize with order items - auto-select all items by default
            const initialItems = order.items.map(item => ({
                productId: item.productId.toString(), // Convert ObjectId to string
                name: item.name,
                price: item.price,
                quantity: item.quantity, // Auto-select full quantity
                maxQuantity: item.quantity,
                selectedOptions: item.selectedOptions,
                image: item.image,
                reason: 'changed_mind', // Default reason
                description: '',
                condition: 'new'
            }));
            setFormData(prev => ({ ...prev, items: initialItems }));

            // Auto-populate selectedItems with all items
            const autoSelectedItems = {};
            order.items.forEach(item => {
                autoSelectedItems[item.productId.toString()] = {
                    quantity: item.quantity,
                    reason: 'changed_mind',
                    description: 'Returning as per customer request',
                    condition: 'new'
                };
            });
            setSelectedItems(autoSelectedItems);
        }
    }, [order]);

    const handleItemSelection = (itemId, quantity, reason, description, condition) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: {
                quantity,
                reason,
                description,
                condition
            }
        }));
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({ ...prev, type }));
        if (type === 'exchange') {
            setShowExchangeProducts(true);
        } else {
            setShowExchangeProducts(false);
            setFormData(prev => ({ ...prev, exchangeItems: [] }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            caption: ''
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const addExchangeItem = (product) => {
        setFormData(prev => ({
            ...prev,
            exchangeItems: [...prev.exchangeItems, {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                selectedOptions: {},
                image: product.images?.[0]?.url || ''
            }]
        }));
    };

    const removeExchangeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            exchangeItems: prev.exchangeItems.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Filter selected items
            const selectedReturnItems = Object.entries(selectedItems)
                .filter(([_, data]) => data.quantity > 0)
                .map(([itemId, data]) => {
                    const orderItem = order.items.find(item => item.productId.toString() === itemId);
                    return {
                        productId: itemId,
                        name: orderItem.name,
                        price: orderItem.price,
                        quantity: data.quantity,
                        selectedOptions: orderItem.selectedOptions,
                        image: orderItem.image,
                        reason: data.reason,
                        description: data.description,
                        condition: data.condition
                    };
                });

            if (selectedReturnItems.length === 0) {
                setError('Please select at least one item to return');
                setLoading(false);
                return;
            }

            // Validate that all selected items have descriptions
            const itemsWithoutDescription = selectedReturnItems.filter(item => !item.description || item.description.trim() === '');
            if (itemsWithoutDescription.length > 0) {
                setError('Please provide a description for all items you want to return');
                setLoading(false);
                return;
            }

            const returnData = {
                orderId: order._id,
                type: formData.type,
                items: selectedReturnItems,
                exchangeItems: formData.exchangeItems,
                customerNotes: formData.customerNotes,
                images: formData.images.map(img => ({
                    url: img.preview,
                    caption: img.caption
                }))
            };

            const response = await apiService.createReturnRequest(returnData);

            if (response.success) {
                setSuccess('Return request submitted successfully!');
                setTimeout(() => {
                    onSuccess?.(response.data);
                    onClose();
                }, 2000);
            } else {
                // Handle API response with success: false
                const errorMessage = response.message || response.error || 'Failed to submit return request';
                setError(errorMessage);
            }
        } catch (err) {
            // Extract error message from different possible error structures
            let errorMessage = 'An error occurred while submitting the request';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h2>
                    <p className="text-gray-600 text-lg">The order you're trying to return could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Header Section */}
            <div className="inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
                <div className="container-custom py-12">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={onClose}
                            className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                            Back to Orders
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Request Return/Exchange</h1>
                            <p className="text-white/80 text-lg">Order #{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-8">

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Return Type Selection */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <RefreshCw className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Return Type</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className={`relative cursor-pointer group ${formData.type === 'return' ? 'ring-2 rounded-2xl ring-primary-500' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="return"
                                    checked={formData.type === 'return'}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`p-6 border-2 rounded-2xl transition-all duration-200 group-hover:shadow-lg ${formData.type === 'return'
                                    ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-blue-50'
                                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.type === 'return'
                                            ? 'bg-gradient-to-r from-primary-600 to-primary-700'
                                            : 'bg-gray-100 group-hover:bg-primary-100'
                                            }`}>
                                            <RefreshCw className={`w-6 h-6 ${formData.type === 'return' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Return for Refund</h3>
                                            <p className="text-gray-600">Get your money back</p>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label className={`relative cursor-pointer group ${formData.type === 'exchange' ? 'ring-2 rounded-2xl ring-primary-500' : ''}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="exchange"
                                    checked={formData.type === 'exchange'}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="sr-only"
                                />
                                <div className={`p-6 border-2 rounded-2xl transition-all duration-200 group-hover:shadow-lg ${formData.type === 'exchange'
                                    ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-blue-50'
                                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.type === 'exchange'
                                            ? 'bg-gradient-to-r from-primary-600 to-primary-700'
                                            : 'bg-gray-100 group-hover:bg-primary-100'
                                            }`}>
                                            <Package className={`w-6 h-6 ${formData.type === 'exchange' ? 'text-white' : 'text-gray-600 group-hover:text-primary-600'}`} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Exchange</h3>
                                            <p className="text-gray-600">Replace with different items</p>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Items Selection */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Items to Return</h2>
                        </div>
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-semibold text-blue-900 mb-1">Pre-selected Items</p>
                                    <p className="text-sm text-blue-800">
                                        All items from this order are pre-selected for return. You can adjust quantities, remove items, or change return reasons below.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {order.items.map((item, index) => {
                                const isSelected = selectedItems[item.productId.toString()]?.quantity > 0;
                                return (
                                    <div key={item.productId.toString()} className={`border-2 rounded-2xl p-6 transition-all duration-200 ${isSelected ? 'border-green-300 bg-gradient-to-r from-green-50/50 to-emerald-50/50 shadow-lg shadow-green-200/25' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
                                        <div className="flex items-start gap-6">
                                            <div className="relative">
                                                <img
                                                    src={item.image || '/placeholder-product.jpg'}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded-xl shadow-sm"
                                                />
                                                {isSelected && (
                                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                                            <span className="font-semibold text-primary-600">₹{item.price} each</span>
                                                            <span>Available: {item.quantity} units</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSelectedItems = { ...selectedItems };
                                                            delete newSelectedItems[item.productId.toString()];
                                                            setSelectedItems(newSelectedItems);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                                        title="Remove this item from return"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                {/* Quantity Selection */}
                                                <div className="mt-4 flex items-center gap-4">
                                                    <label className="text-sm font-semibold text-gray-700">Quantity:</label>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentQty = selectedItems[item.productId.toString()]?.quantity || 0;
                                                                if (currentQty > 0) {
                                                                    handleItemSelection(
                                                                        item.productId.toString(),
                                                                        currentQty - 1,
                                                                        selectedItems[item.productId.toString()]?.reason || '',
                                                                        selectedItems[item.productId.toString()]?.description || '',
                                                                        selectedItems[item.productId.toString()]?.condition || 'new'
                                                                    );
                                                                }
                                                            }}
                                                            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                                                        >
                                                            <Minus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                        <span className="w-12 text-center text-lg font-bold text-gray-900">
                                                            {selectedItems[item.productId.toString()]?.quantity || 0}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const currentQty = selectedItems[item.productId.toString()]?.quantity || 0;
                                                                if (currentQty < item.quantity) {
                                                                    handleItemSelection(
                                                                        item.productId.toString(),
                                                                        currentQty + 1,
                                                                        selectedItems[item.productId.toString()]?.reason || '',
                                                                        selectedItems[item.productId.toString()]?.description || '',
                                                                        selectedItems[item.productId.toString()]?.condition || 'new'
                                                                    );
                                                                }
                                                            }}
                                                            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                                                        >
                                                            <Plus className="w-4 h-4 text-gray-600" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Return Details (only show if quantity > 0) */}
                                                {selectedItems[item.productId.toString()]?.quantity > 0 && (
                                                    <div className="mt-6 space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                    Reason for Return
                                                                </label>
                                                                <select
                                                                    value={selectedItems[item.productId.toString()]?.reason || ''}
                                                                    onChange={(e) => {
                                                                        const current = selectedItems[item.productId.toString()] || {};
                                                                        handleItemSelection(
                                                                            item.productId.toString(),
                                                                            current.quantity,
                                                                            e.target.value,
                                                                            current.description,
                                                                            current.condition
                                                                        );
                                                                    }}
                                                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                >
                                                                    <option value="">Select reason</option>
                                                                    {returnReasons.map(reason => (
                                                                        <option key={reason.value} value={reason.value}>
                                                                            {reason.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                    Item Condition
                                                                </label>
                                                                <select
                                                                    value={selectedItems[item.productId.toString()]?.condition || 'new'}
                                                                    onChange={(e) => {
                                                                        const current = selectedItems[item.productId.toString()] || {};
                                                                        handleItemSelection(
                                                                            item.productId.toString(),
                                                                            current.quantity,
                                                                            current.reason,
                                                                            current.description,
                                                                            e.target.value
                                                                        );
                                                                    }}
                                                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                                >
                                                                    {itemConditions.map(condition => (
                                                                        <option key={condition.value} value={condition.value}>
                                                                            {condition.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                                Additional Details <span className="text-red-500">*</span>
                                                            </label>
                                                            <textarea
                                                                value={selectedItems[item.productId.toString()]?.description || ''}
                                                                onChange={(e) => {
                                                                    const current = selectedItems[item.productId.toString()] || {};
                                                                    handleItemSelection(
                                                                        item.productId.toString(),
                                                                        current.quantity,
                                                                        current.reason,
                                                                        e.target.value,
                                                                        current.condition
                                                                    );
                                                                }}
                                                                placeholder="Please provide more details about why you're returning this item..."
                                                                rows={3}
                                                                required
                                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                                                            />
                                                            {!selectedItems[item.productId.toString()]?.description && (
                                                                <p className="text-xs text-red-500 mt-1">Description is required</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Return Summary</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700 font-semibold">
                                        {Object.values(selectedItems).filter(item => item.quantity > 0).length} item(s) selected for return
                                    </span>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Total Refund</p>
                                        <p className="text-xl font-bold text-primary-600">
                                            ₹{Object.entries(selectedItems).reduce((total, [itemId, item]) => {
                                                const orderItem = order.items.find(oi => oi.productId.toString() === itemId);
                                                return total + (orderItem ? orderItem.price * item.quantity : 0);
                                            }, 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exchange Items (only for exchange type) */}
                    {formData.type === 'exchange' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Exchange Items</h2>
                            </div>
                            <p className="text-gray-600 mb-6 text-lg">Select the items you'd like to exchange for:</p>

                            {/* Exchange items will be added here */}
                            <div className="text-center py-12 text-gray-500">
                                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-12 h-12 text-white" />
                                </div>
                                <p className="text-lg">Exchange product selection will be implemented here</p>
                            </div>
                        </div>
                    )}

                    {/* Additional Notes */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Additional Notes</h2>
                        </div>
                        <textarea
                            value={formData.customerNotes}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
                            placeholder="Any additional information about your return request..."
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Upload Images (Optional)</h2>
                        </div>
                        <p className="text-gray-600 mb-6 text-lg">Upload photos to help us understand the issue better</p>

                        <div className="space-y-6">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:transition-colors file:duration-200"
                            />

                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.preview}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-24 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error and Success Messages */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <p className="text-green-700 font-medium">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !Object.values(selectedItems).some(item => item.quantity > 0) || Object.values(selectedItems).some(item => item.quantity > 0 && (!item.description || item.description.trim() === ''))}
                            className="btn-primary group relative px-8 py-3 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            title={
                                !Object.values(selectedItems).some(item => item.quantity > 0)
                                    ? "Please select at least one item to return"
                                    : Object.values(selectedItems).some(item => item.quantity > 0 && (!item.description || item.description.trim() === ''))
                                        ? "Please provide descriptions for all selected items"
                                        : ""
                            }
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    Submit Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnRequestForm;
