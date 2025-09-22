import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
    MoreVertical,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock
} from 'lucide-react'

export default function UsersPage() {
    const dispatch = useDispatch()
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
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        isActive: true
    })

    useEffect(() => {
        dispatch(listUsers())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => dispatch(clearError()), 5000)
            return () => clearTimeout(timer)
        }
    }, [error, dispatch])

    const handleRefresh = () => {
        dispatch(listUsers())
    }

    const handleViewUser = (user) => {
        setSelectedUser(user)
        setShowUserDetails(true)
        dispatch(getUserById(user._id))
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            isActive: user.isActive !== false
        })
        setShowEditModal(true)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        if (!selectedUser) return

        dispatch(updateUser({ id: selectedUser._id, userData: editForm }))
        setShowEditModal(false)
        setSelectedUser(null)
    }

    const handleDeleteUser = async (user) => {
        if (window.confirm(`Are you sure you want to delete user ${user.name}?`)) {
            dispatch(deleteUser(user._id))
        }
    }

    const handleToggleStatus = (user) => {
        dispatch(toggleUserStatus({ id: user._id, isActive: !user.isActive }))
    }

    const getStatusColor = (isActive) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }

    const getVerificationColor = (isEmailVerified) => {
        return isEmailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }

    const getVerificationIcon = (isEmailVerified) => {
        return isEmailVerified ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />
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

    const getTotalUsers = () => items.length
    const getActiveUsers = () => items.filter(user => user.isActive !== false).length
    const getVerifiedUsers = () => items.filter(user => user.isEmailVerified).length
    const getRecentUsers = () => {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return items.filter(user => new Date(user.createdAt) > oneWeekAgo).length
    }

    const UserStatusBadge = ({ isActive }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(isActive)}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    )

    const VerificationBadge = ({ isEmailVerified }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getVerificationColor(isEmailVerified)}`}>
            {getVerificationIcon(isEmailVerified)}
            {isEmailVerified ? 'Verified' : 'Unverified'}
        </span>
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">Manage registered users and their accounts</p>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{getTotalUsers()}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-50">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{getActiveUsers()}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-50">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Verified Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{getVerifiedUsers()}</p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-50">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">New This Week</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{getRecentUsers()}</p>
                        </div>
                        <div className="p-3 rounded-full bg-orange-50">
                            <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 group-hover:scale-110 transition-transform ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-500" />
                            <select
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                                className="px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                            >
                                <option value="all">All Verification</option>
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredUsers.length > 0 ? (
                        <div className="space-y-4">
                            {filteredUsers.map((user) => (
                                <div key={user._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {user.name || 'Unknown User'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <UserStatusBadge isActive={user.isActive} />
                                                <VerificationBadge isEmailVerified={user.isEmailVerified} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-700">{user.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-700">{user.phone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500" />
                                                    <span className="text-gray-700">
                                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {user.addresses && user.addresses.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-600 mb-1">Addresses ({user.addresses.length}):</p>
                                                    <div className="space-y-1">
                                                        {user.addresses.slice(0, 2).map((address, index) => (
                                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                                <MapPin className="w-3 h-3 text-gray-500" />
                                                                <span className="text-gray-700">
                                                                    {address.address}, {address.city}, {address.state} {address.pincode}
                                                                </span>
                                                                {address.isDefault && (
                                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {user.addresses.length > 2 && (
                                                            <p className="text-xs text-gray-500">
                                                                +{user.addresses.length - 2} more addresses
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => handleViewUser(user)}
                                                className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                View Details
                                            </button>

                                            <button
                                                onClick={() => handleEditUser(user)}
                                                className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl shadow-lg shadow-gray-500/25 hover:shadow-xl hover:shadow-gray-500/30 hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                            >
                                                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={updateLoading}
                                                className={`group relative px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${user.isActive
                                                    ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700'
                                                    }`}
                                            >
                                                {user.isActive ? <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>

                                            <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={deleteLoading}
                                                className="group relative px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <User className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                                    ? 'No users match your current filters.'
                                    : 'No users have registered yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                                User Details - {selectedUser.name}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowUserDetails(false)
                                    setSelectedUser(null)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {currentUser ? (
                            <div className="space-y-6">
                                {/* User Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{currentUser.name}</h3>
                                            <p className="text-gray-600">{currentUser.email}</p>
                                            <div className="flex gap-2 mt-2">
                                                <UserStatusBadge isActive={currentUser.isActive} />
                                                <VerificationBadge isEmailVerified={currentUser.isEmailVerified} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Basic Information
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <span className="text-gray-900">{currentUser.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Email:</span>
                                                <span className="text-gray-900">{currentUser.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Phone:</span>
                                                <span className="text-gray-900">{currentUser.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Member Since:</span>
                                                <span className="text-gray-900">
                                                    {new Date(currentUser.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Last Updated:</span>
                                                <span className="text-gray-900">
                                                    {new Date(currentUser.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Status */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <Shield className="w-5 h-5" />
                                            Account Status
                                        </h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Status:</span>
                                                <UserStatusBadge isActive={currentUser.isActive} />
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Email Verified:</span>
                                                <VerificationBadge isEmailVerified={currentUser.isEmailVerified} />
                                            </div>
                                            {currentUser.emailVerificationExpires && (
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-700">Verification Expires:</span>
                                                    <span className="text-gray-900">
                                                        {new Date(currentUser.emailVerificationExpires).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Addresses */}
                                {currentUser.addresses && currentUser.addresses.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                            <MapPin className="w-5 h-5" />
                                            Addresses ({currentUser.addresses.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {currentUser.addresses.map((address, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{address.name || 'Address'}</p>
                                                            <p className="text-gray-700">{address.address}</p>
                                                            <p className="text-gray-700">
                                                                {address.city}, {address.state} {address.pincode}
                                                            </p>
                                                            {address.landmark && (
                                                                <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                                                            )}
                                                        </div>
                                                        {address.isDefault && (
                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            setShowUserDetails(false)
                                            setSelectedUser(null)
                                        }}
                                        className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleEditUser(currentUser)}
                                        className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                                    >
                                        Edit User
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading user details...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                                    Active User
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="group relative px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="group relative px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {updateLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
