'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, MapPin, Phone, Mail, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function DeliveryPartnerPage() {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        companyName: '',
        registrationNumber: '',
        gstNumber: '',
        contactPerson: '',
        email: '',
        phone: '',
        alternatePhone: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        },
        serviceAreas: [],
        services: [],
        deliveryCapabilities: {
            maxWeight: '',
            maxDimensions: {
                length: '',
                width: '',
                height: ''
            },
            vehicleTypes: [],
            specialHandling: [],
            workingHours: {
                start: '09:00',
                end: '18:00',
                workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
            }
        },
        pricing: {
            baseDeliveryFee: '',
            fuelSurcharge: '',
            additionalCharges: [],
            paymentTerms: 'COD',
            billingCycle: 'weekly'
        },
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: ''
        },
        commission: {
            type: 'percentage',
            value: '',
            minimumPayout: ''
        },
        status: 'pending_approval',
        isAvailable: true,
        isVerified: false,
        tags: '',
        notes: ''
    });

    const statusOptions = [
        { value: 'pending_approval', label: 'Pending Approval', color: 'yellow' },
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'inactive', label: 'Inactive', color: 'gray' },
        { value: 'suspended', label: 'Suspended', color: 'red' }
    ];

    const serviceTypes = [
        'Standard Delivery',
        'Express Delivery',
        'Same Day Delivery',
        'Heavy Item Delivery',
        'Fragile Item Delivery',
        'Oversized Item Delivery'
    ];

    const vehicleTypes = [
        { type: 'bike', capacity: 'Up to 5kg' },
        { type: 'car', capacity: 'Up to 50kg' },
        { type: 'van', capacity: 'Up to 200kg' },
        { type: 'truck', capacity: 'Up to 1000kg' }
    ];

    const specialHandlingOptions = [
        'Fragile',
        'Heavy',
        'Oversized',
        'Hazardous',
        'Temperature Controlled',
        'White Glove Service'
    ];

    const workingDays = [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];

    useEffect(() => { fetchPartners(); }, []);

    const fetchPartners = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/delivery-partners');
            const data = res?.data || res;
            setPartners(Array.isArray(data) ? data : []);
        } catch (e) {
            setError('Failed to load delivery partners');
            setPartners([]);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name) => {
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
        setForm({ ...form, slug });
    };

    const resetForm = () => {
        setForm({
            name: '', slug: '', description: '', companyName: '', registrationNumber: '', gstNumber: '',
            contactPerson: '', email: '', phone: '', alternatePhone: '',
            address: { street: '', city: '', state: '', pincode: '', country: 'India' },
            serviceAreas: [], services: [],
            deliveryCapabilities: {
                maxWeight: '', maxDimensions: { length: '', width: '', height: '' },
                vehicleTypes: [], specialHandling: [],
                workingHours: { start: '09:00', end: '18:00', workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
            },
            pricing: { baseDeliveryFee: '', fuelSurcharge: '', additionalCharges: [], paymentTerms: 'COD', billingCycle: 'weekly' },
            bankDetails: { accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', branchName: '' },
            commission: { type: 'percentage', value: '', minimumPayout: '' },
            status: 'pending_approval', isAvailable: true, isVerified: false, tags: '', notes: ''
        });
        setEditing(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            setSaving(true);
            const fd = new FormData();

            // Basic info
            fd.append('name', form.name);
            fd.append('slug', form.slug);
            fd.append('description', form.description);
            fd.append('companyName', form.companyName);
            fd.append('registrationNumber', form.registrationNumber);
            fd.append('gstNumber', form.gstNumber);
            fd.append('contactPerson', form.contactPerson);
            fd.append('email', form.email);
            fd.append('phone', form.phone);
            fd.append('alternatePhone', form.alternatePhone);

            // Complex objects
            fd.append('address', JSON.stringify(form.address));
            fd.append('serviceAreas', JSON.stringify(form.serviceAreas));
            fd.append('services', JSON.stringify(form.services));
            fd.append('deliveryCapabilities', JSON.stringify(form.deliveryCapabilities));
            fd.append('pricing', JSON.stringify(form.pricing));
            fd.append('bankDetails', JSON.stringify(form.bankDetails));
            fd.append('commission', JSON.stringify(form.commission));

            // Status and metadata
            fd.append('status', form.status);
            fd.append('isAvailable', form.isAvailable);
            fd.append('isVerified', form.isVerified);
            fd.append('tags', form.tags);
            fd.append('notes', form.notes);

            if (editing) {
                await apiClient.put(`/api/delivery-partners/${editing._id}`, fd);
            } else {
                await apiClient.post('/api/delivery-partners', fd);
            }
            setShowForm(false);
            resetForm();
            fetchPartners();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to save delivery partner');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (partner) => {
        setEditing(partner);
        setForm({
            name: partner.name,
            slug: partner.slug,
            description: partner.description || '',
            companyName: partner.companyName,
            registrationNumber: partner.registrationNumber || '',
            gstNumber: partner.gstNumber || '',
            contactPerson: partner.contactPerson,
            email: partner.email,
            phone: partner.phone,
            alternatePhone: partner.alternatePhone || '',
            address: partner.address || { street: '', city: '', state: '', pincode: '', country: 'India' },
            serviceAreas: partner.serviceAreas || [],
            services: partner.services || [],
            deliveryCapabilities: partner.deliveryCapabilities || {
                maxWeight: '', maxDimensions: { length: '', width: '', height: '' },
                vehicleTypes: [], specialHandling: [],
                workingHours: { start: '09:00', end: '18:00', workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }
            },
            pricing: partner.pricing || { baseDeliveryFee: '', fuelSurcharge: '', additionalCharges: [], paymentTerms: 'COD', billingCycle: 'weekly' },
            bankDetails: partner.bankDetails || { accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', branchName: '' },
            commission: partner.commission || { type: 'percentage', value: '', minimumPayout: '' },
            status: partner.status || 'pending_approval',
            isAvailable: partner.isAvailable !== undefined ? partner.isAvailable : true,
            isVerified: partner.isVerified || false,
            tags: Array.isArray(partner.tags) ? partner.tags.join(', ') : (partner.tags || ''),
            notes: partner.notes || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this delivery partner?')) return;
        try {
            await apiClient.delete(`/api/delivery-partners/${id}`);
            fetchPartners();
        } catch (e) {
            setError('Failed to delete delivery partner');
        }
    };

    const handleStatusChange = async (id, status, isAvailable) => {
        try {
            await apiClient.patch(`/api/delivery-partners/${id}/status`, { status, isAvailable });
            fetchPartners();
        } catch (e) {
            setError('Failed to update status');
        }
    };

    const addServiceArea = () => {
        setForm({
            ...form,
            serviceAreas: [...form.serviceAreas, { city: '', state: '', pincodes: [], isActive: true }]
        });
    };

    const updateServiceArea = (index, field, value) => {
        const updated = [...form.serviceAreas];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, serviceAreas: updated });
    };

    const removeServiceArea = (index) => {
        const updated = form.serviceAreas.filter((_, i) => i !== index);
        setForm({ ...form, serviceAreas: updated });
    };

    const addService = () => {
        setForm({
            ...form,
            services: [...form.services, { name: '', description: '', basePrice: '', pricePerKm: '', minimumCharge: '', isActive: true }]
        });
    };

    const updateService = (index, field, value) => {
        const updated = [...form.services];
        updated[index] = { ...updated[index], [field]: value };
        setForm({ ...form, services: updated });
    };

    const removeService = (index) => {
        const updated = form.services.filter((_, i) => i !== index);
        setForm({ ...form, services: updated });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
                <div className="px-6 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Partners</h1>
                        <p className="text-gray-600">Manage delivery partner companies and their services</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow"
                    >
                        <Plus size={18} /> Add Delivery Partner
                    </button>
                </div>
            </div>

            <div className="py-6 space-y-6">
                {error && <div className="mx-6 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>}

                {showForm && (
                    <div className="mx-6 bg-white rounded-2xl border p-6 shadow max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="font-semibold text-lg">{editing ? 'Edit' : 'Add'} Delivery Partner</div>
                            <button
                                className="text-gray-600 hover:text-gray-900"
                                onClick={() => { setShowForm(false); resetForm(); }}
                            >
                                Close
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Partner Name *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        onBlur={() => generateSlug(form.name)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.companyName}
                                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Contact Person *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.contactPerson}
                                        onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email *</label>
                                    <input
                                        type="email"
                                        className="w-full border rounded px-3 py-2"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone *</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Alternate Phone</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        value={form.alternatePhone}
                                        onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Street</label>
                                        <input
                                            className="w-full border rounded px-3 py-2"
                                            value={form.address.street}
                                            onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">City</label>
                                        <input
                                            className="w-full border rounded px-3 py-2"
                                            value={form.address.city}
                                            onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">State</label>
                                        <input
                                            className="w-full border rounded px-3 py-2"
                                            value={form.address.state}
                                            onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pincode</label>
                                        <input
                                            className="w-full border rounded px-3 py-2"
                                            value={form.address.pincode}
                                            onChange={(e) => setForm({ ...form, address: { ...form.address, pincode: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Areas */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">Service Areas</h3>
                                    <button
                                        type="button"
                                        onClick={addServiceArea}
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Add Area
                                    </button>
                                </div>
                                {form.serviceAreas.map((area, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-3 border rounded">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">City</label>
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                value={area.city}
                                                onChange={(e) => updateServiceArea(index, 'city', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">State</label>
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                value={area.state}
                                                onChange={(e) => updateServiceArea(index, 'state', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Pincodes (comma separated)</label>
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                value={area.pincodes.join(', ')}
                                                onChange={(e) => updateServiceArea(index, 'pincodes', e.target.value.split(',').map(p => p.trim()).filter(Boolean))}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeServiceArea(index)}
                                                className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Services */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">Services</h3>
                                    <button
                                        type="button"
                                        onClick={addService}
                                        className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                    >
                                        Add Service
                                    </button>
                                </div>
                                {form.services.map((service, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3 p-3 border rounded">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Service Name</label>
                                            <input
                                                className="w-full border rounded px-3 py-2"
                                                value={service.name}
                                                onChange={(e) => updateService(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Base Price</label>
                                            <input
                                                type="number"
                                                className="w-full border rounded px-3 py-2"
                                                value={service.basePrice}
                                                onChange={(e) => updateService(index, 'basePrice', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Price per KM</label>
                                            <input
                                                type="number"
                                                className="w-full border rounded px-3 py-2"
                                                value={service.pricePerKm}
                                                onChange={(e) => updateService(index, 'pricePerKm', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Min Charge</label>
                                            <input
                                                type="number"
                                                className="w-full border rounded px-3 py-2"
                                                value={service.minimumCharge}
                                                onChange={(e) => updateService(index, 'minimumCharge', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeService(index)}
                                                className="bg-red-500 text-white px-3 py-2 rounded text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Status and Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Status</label>
                                    <select
                                        className="w-full border rounded px-3 py-2"
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.isAvailable}
                                            onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                                        />
                                        Available
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={form.isVerified}
                                            onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
                                        />
                                        Verified
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 border rounded"
                                    onClick={() => { setShowForm(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (editing ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mx-6 bg-white rounded-2xl border overflow-hidden">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2 text-purple-700">
                            <Truck size={16} />
                            <span className="font-semibold">{partners.length} delivery partners</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Partner</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Service Areas</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Performance</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {partners.map(partner => (
                                    <tr key={partner._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <div>
                                                <div className="font-medium text-gray-900">{partner.name}</div>
                                                <div className="text-sm text-gray-500">{partner.companyName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Phone size={12} />
                                                    {partner.phone}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {partner.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            {partner.serviceAreas?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {partner.serviceAreas.slice(0, 2).map((area, idx) => (
                                                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                                            {area.city}, {area.state}
                                                        </span>
                                                    ))}
                                                    {partner.serviceAreas.length > 2 && (
                                                        <span className="text-xs text-gray-500">+{partner.serviceAreas.length - 2} more</span>
                                                    )}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${partner.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        partner.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                                                            partner.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {statusOptions.find(s => s.value === partner.status)?.label}
                                                </span>
                                                {partner.isAvailable ? (
                                                    <CheckCircle size={16} className="text-green-500" />
                                                ) : (
                                                    <XCircle size={16} className="text-red-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-700">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Star size={12} className="text-yellow-500" />
                                                {partner.performance?.customerRating || 0}/5
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {partner.performance?.totalDeliveries || 0} deliveries
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="px-3 py-1.5 text-xs rounded bg-blue-50 text-blue-700"
                                                    onClick={() => handleEdit(partner)}
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 text-xs rounded bg-red-50 text-red-700"
                                                    onClick={() => handleDelete(partner._id)}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

















