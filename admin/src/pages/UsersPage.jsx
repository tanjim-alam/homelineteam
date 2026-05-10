import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../context/ToastContext'
import {
    listUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserStatus,
    clearError
} from '../store/slices/userSlice'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    Search,
    Filter,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock,
    Users,
    UserCheck,
    UserX,
    TrendingUp
} from 'lucide-react'

function Portal({ children }) { return createPortal(children, document.body) }

export default function UsersPage() {
    const dispatch = useDispatch()
    const { showToast } = useToast()
    const {
        items,
        currentUser,
        loading,
        error,
        updateLoading,
        deleteLoading
    } = useSelector(s => s.users)

    const [selectedUser, setSelectedUser] = useState(null)
    const [showUserDetails, setShowUserDetails] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [verificationFilter, setVerificationFilter] = useState('all')
    const [showEditModal, setShowEditModal] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', isActive: true })

    useEffect(() => { dispatch(listUsers()) }, [dispatch])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000)
            return () => clearTimeout(timer)
        }
    }, [error, dispatch])

    const handleViewUser = (user) => {
        setSelectedUser(user)
        setShowUserDetails(true)
        dispatch(getUserById(user._id))
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setEditForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', isActive: user.isActive !== false })
        setShowEditModal(true)
    }

    const handleEditSubmit = (e) => {
        e.preventDefault()
        if (!selectedUser) return
        dispatch(updateUser({ id: selectedUser._id, userData: editForm }))
            .unwrap()
            .then(() => showToast('success', 'User updated'))
            .catch(() => showToast('error', 'Failed to update user'))
        setShowEditModal(false)
        setSelectedUser(null)
    }

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Delete user ${user.name}?`)) {
            try {
                await dispatch(deleteUser(user._id)).unwrap()
                dispatch(listUsers())
                showToast('success', 'User deleted')
            } catch (err) {
                showToast('error', 'Failed to delete user')
            }
        }
    }

    const handleToggleStatus = (user) => {
        dispatch(toggleUserStatus({ id: user._id, isActive: !user.isActive }))
    }

    const filteredUsers = items.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm)
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.isActive !== false) ||
            (statusFilter === 'inactive' && user.isActive === false)
        const matchesVerification = verificationFilter === 'all' ||
            (verificationFilter === 'verified' && user.isEmailVerified) ||
            (verificationFilter === 'unverified' && !user.isEmailVerified)
        return matchesSearch && matchesStatus && matchesVerification
    })

    const totalUsers = items.length
    const activeUsers = items.filter(u => u.isActive !== false).length
    const verifiedUsers = items.filter(u => u.isEmailVerified).length
    const recentUsers = (() => {
        const d = new Date(); d.setDate(d.getDate() - 7)
        return items.filter(u => new Date(u.createdAt) > d).length
    })()

    const stats = [
        { label: 'Total Users', value: totalUsers, icon: Users, color: 'blue', sub: 'All registered' },
        { label: 'Active', value: activeUsers, icon: UserCheck, color: 'green', sub: 'Currently active' },
        { label: 'Verified', value: verifiedUsers, icon: Shield, color: 'purple', sub: 'Email verified' },
        { label: 'New This Week', value: recentUsers, icon: TrendingUp, color: 'orange', sub: 'Recent signups' },
    ]

    const colorMap = {
        blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', val: 'text-blue-700', border: 'border-blue-100' },
        green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', val: 'text-green-700', border: 'border-green-100' },
        purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700', border: 'border-purple-100' },
        orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', val: 'text-orange-700', border: 'border-orange-100' },
    }

    const StatusBadge = ({ isActive }) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive !== false ? 'bg-green-500' : 'bg-red-500'}`} />
            {isActive !== false ? 'Active' : 'Inactive'}
        </span>
    )

    const VerifyBadge = ({ verified }) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {verified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {verified ? 'Verified' : 'Pending'}
        </span>
    )

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage registered users and their accounts</p>
                    </div>
                    <button
                        onClick={() => dispatch(listUsers())}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map(({ label, value, icon: Icon, color, sub }) => {
                        const c = colorMap[color]
                        return (
                            <div key={label} className={`bg-white rounded-xl border ${c.border} p-5 flex items-center gap-4`}>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
                                    <p className="text-xs font-semibold text-gray-700 leading-none">{label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <select
                                value={verificationFilter}
                                onChange={e => setVerificationFilter(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50"
                            >
                                <option value="all">All Verification</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="divide-y divide-gray-50">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3.5 bg-gray-200 rounded w-40" />
                                        <div className="h-3 bg-gray-100 rounded w-56" />
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                                    <div className="h-6 bg-gray-100 rounded-full w-16" />
                                </div>
                            ))}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                                <User className="w-7 h-7 text-gray-400" />
                            </div>
                            <p className="text-base font-semibold text-gray-700">No users found</p>
                            <p className="text-sm text-gray-400 mt-1">
                                {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No users have registered yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{user.name || 'Unknown'}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <p className="text-gray-700">{user.phone || <span className="text-gray-300">—</span>}</p>
                                                {user.addresses?.length > 0 && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3" />
                                                        {user.addresses.length} address{user.addresses.length > 1 ? 'es' : ''}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <StatusBadge isActive={user.isActive} />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <VerifyBadge verified={user.isEmailVerified} />
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-500 text-xs">
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleViewUser(user)}
                                                        title="View Details"
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        title="Edit User"
                                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={updateLoading}
                                                        title={user.isActive !== false ? 'Deactivate' : 'Activate'}
                                                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${user.isActive !== false
                                                            ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                                            : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                                        }`}
                                                    >
                                                        {user.isActive !== false ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        disabled={deleteLoading}
                                                        title="Delete User"
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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
            </div>

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-[9999] overflow-y-auto py-10 px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">User Details</h3>
                                        <p className="text-xs text-gray-400">{selectedUser.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowUserDetails(false); setSelectedUser(null) }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            {currentUser ? (
                                <div className="p-6 space-y-5">
                                    {/* Avatar + Status */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                                            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-lg truncate">{currentUser.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5 items-end">
                                            <StatusBadge isActive={currentUser.isActive} />
                                            <VerifyBadge verified={currentUser.isEmailVerified} />
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { icon: Mail, label: 'Email', value: currentUser.email },
                                            { icon: Phone, label: 'Phone', value: currentUser.phone || '—' },
                                            { icon: Calendar, label: 'Member Since', value: new Date(currentUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                            { icon: Calendar, label: 'Last Updated', value: new Date(currentUser.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Addresses */}
                                    {currentUser.addresses?.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                Addresses ({currentUser.addresses.length})
                                            </p>
                                            <div className="space-y-2">
                                                {currentUser.addresses.map((addr, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                                        <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-700">
                                                                {addr.address}, {addr.city}, {addr.state} {addr.pincode}
                                                            </p>
                                                            {addr.landmark && <p className="text-xs text-gray-400 mt-0.5">Near {addr.landmark}</p>}
                                                        </div>
                                                        {addr.isDefault && (
                                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold shrink-0">Default</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => { setShowUserDetails(false); setSelectedUser(null) }}
                                            className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => { setShowUserDetails(false); handleEditUser(currentUser) }}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit User
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                                    <p className="text-sm text-gray-500 mt-3">Loading user details…</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Portal>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <Portal>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                                        <Edit className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Edit User</h3>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                {[
                                    { label: 'Name', type: 'text', key: 'name', required: true },
                                    { label: 'Email', type: 'email', key: 'email', required: true },
                                    { label: 'Phone', type: 'tel', key: 'phone', required: false },
                                ].map(({ label, type, key, required }) => (
                                    <div key={key}>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                                        <input
                                            type={type}
                                            value={editForm[key]}
                                            onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                                            required={required}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-gray-50 transition-colors"
                                        />
                                    </div>
                                ))}

                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isActive}
                                        onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-semibold text-gray-700">Active User</span>
                                </label>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                    >
                                        {updateLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                                Saving…
                                            </>
                                        ) : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    )
}
