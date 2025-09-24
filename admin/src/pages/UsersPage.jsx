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
            try {
                await dispatch(deleteUser(user._id)).unwrap()
                // Refresh the user list after successful deletion
                dispatch(listUsers())
            } catch (error) {
                console.error('Failed to delete user:', error)
            }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="p-6 max-w-7xl mx-auto space-y-8">
                {/* Modern Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                                User Management
                            </h1>
                            <p className="text-lg text-gray-600">Manage registered users and their accounts</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh Users
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Error Alert */}
                {error && (
                    <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-red-800">Error</h3>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-600 mb-2">Total Users</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">{getTotalUsers()}</p>
                                <p className="text-xs text-gray-500 mt-1">All registered users</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-600 mb-2">Active Users</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 bg-clip-text text-transparent">{getActiveUsers()}</p>
                                <p className="text-xs text-gray-500 mt-1">Currently active</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-600 mb-2">Verified Users</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">{getVerifiedUsers()}</p>
                                <p className="text-xs text-gray-500 mt-1">Email verified</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center shadow-lg">
                                <Shield className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-gray-600 mb-2">New This Week</p>
                                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-amber-900 bg-clip-text text-transparent">{getRecentUsers()}</p>
                                <p className="text-xs text-gray-500 mt-1">Recent signups</p>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-200 rounded-2xl flex items-center justify-center shadow-lg">
                                <Calendar className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Filter and Users List */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <div className="p-8 border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                        All Users
                                    </h2>
                                    <p className="text-gray-600 mt-1 text-lg">Manage and track user accounts</p>
                                </div>
                            </div>
                        </div>

                        {/* Modern Filters */}
                        <div className="mt-6 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-6 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
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
                                    className="px-6 py-3 text-sm border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                                >
                                    <option value="all">All Verification</option>
                                    <option value="verified">Verified</option>
                                    <option value="unverified">Unverified</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="space-y-6">
                                {filteredUsers.map((user) => (
                                    <div key={user._id} className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 hover:shadow-xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-6">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                                            {user.name || 'Unknown User'}
                                                        </h3>
                                                        <p className="text-gray-600 mt-1">{user.email}</p>
                                                    </div>
                                                    <div className="ml-auto flex gap-3">
                                                        <UserStatusBadge isActive={user.isActive} />
                                                        <VerificationBadge isEmailVerified={user.isEmailVerified} />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-4 border border-blue-100/50">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Mail className="w-5 h-5 text-blue-600" />
                                                            <p className="text-sm font-bold text-gray-700">Email</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900 text-lg">{user.email || 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-4 border border-green-100/50">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Phone className="w-5 h-5 text-green-600" />
                                                            <p className="text-sm font-bold text-gray-700">Phone</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900 text-lg">{user.phone || 'N/A'}</p>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-4 border border-purple-100/50">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Calendar className="w-5 h-5 text-purple-600" />
                                                            <p className="text-sm font-bold text-gray-700">Joined</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900 text-lg">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {user.addresses && user.addresses.length > 0 && (
                                                    <div className="mb-6">
                                                        <p className="text-sm text-gray-600 mb-3 font-bold">Addresses ({user.addresses.length}):</p>
                                                        <div className="space-y-2">
                                                            {user.addresses.slice(0, 2).map((address, index) => (
                                                                <div key={index} className="flex items-center gap-3 text-sm bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl p-3 border border-amber-100/50">
                                                                    <MapPin className="w-4 h-4 text-amber-600" />
                                                                    <span className="text-gray-700 font-medium">
                                                                        {address.address}, {address.city}, {address.state} {address.pincode}
                                                                    </span>
                                                                    {address.isDefault && (
                                                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-bold">Default</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {user.addresses.length > 2 && (
                                                                <p className="text-xs text-gray-500 font-medium">
                                                                    +{user.addresses.length - 2} more addresses
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-3 ml-6">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    View Details
                                                </button>

                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl shadow-xl shadow-gray-500/25 hover:shadow-2xl hover:shadow-gray-500/30 hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={updateLoading}
                                                    className={`group relative px-6 py-3 text-sm font-bold text-white rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${user.isActive
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700'
                                                        : 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/30 hover:from-green-600 hover:to-green-700'
                                                        }`}
                                                >
                                                    {user.isActive ? <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    disabled={deleteLoading}
                                                    className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No users found</h3>
                                <p className="text-lg text-gray-600">
                                    {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
                                        ? 'No users match your current filters.'
                                        : 'No users have registered yet.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modern User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-6 w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-2xl rounded-3xl bg-white/95 backdrop-blur-sm border border-white/20">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                        User Details - {selectedUser.name}
                                    </h3>
                                    <p className="text-gray-600 mt-1">Complete user information and account details</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowUserDetails(false)
                                    setSelectedUser(null)
                                }}
                                className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {currentUser ? (
                            <div className="space-y-8">
                                {/* Modern User Header */}
                                <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm p-8 rounded-3xl border border-blue-200/50 shadow-xl">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                                            {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">{currentUser.name}</h3>
                                            <p className="text-lg text-gray-600 mt-1">{currentUser.email}</p>
                                            <div className="flex gap-3 mt-3">
                                                <UserStatusBadge isActive={currentUser.isActive} />
                                                <VerificationBadge isEmailVerified={currentUser.isEmailVerified} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Modern Basic Information */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                                                Basic Information
                                            </h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Name:</span>
                                                <span className="text-gray-900 font-semibold">{currentUser.name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Email:</span>
                                                <span className="text-gray-900 font-semibold">{currentUser.email || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Phone:</span>
                                                <span className="text-gray-900 font-semibold">{currentUser.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Member Since:</span>
                                                <span className="text-gray-900 font-semibold">
                                                    {new Date(currentUser.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Last Updated:</span>
                                                <span className="text-gray-900 font-semibold">
                                                    {new Date(currentUser.updatedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modern Account Status */}
                                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                                <Shield className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                                Account Status
                                            </h4>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Status:</span>
                                                <UserStatusBadge isActive={currentUser.isActive} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-gray-700">Email Verified:</span>
                                                <VerificationBadge isEmailVerified={currentUser.isEmailVerified} />
                                            </div>
                                            {currentUser.emailVerificationExpires && (
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-700">Verification Expires:</span>
                                                    <span className="text-gray-900 font-semibold">
                                                        {new Date(currentUser.emailVerificationExpires).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Addresses */}
                                {currentUser.addresses && currentUser.addresses.length > 0 && (
                                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-orange-900 bg-clip-text text-transparent">
                                                Addresses ({currentUser.addresses.length})
                                            </h4>
                                        </div>
                                        <div className="space-y-4">
                                            {currentUser.addresses.map((address, index) => (
                                                <div key={index} className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-6 rounded-2xl border border-amber-100/50">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 text-lg">{address.name || 'Address'}</p>
                                                            <p className="text-gray-700 mt-1">{address.address}</p>
                                                            <p className="text-gray-700">
                                                                {address.city}, {address.state} {address.pincode}
                                                            </p>
                                                            {address.landmark && (
                                                                <p className="text-sm text-gray-600 mt-1">Landmark: {address.landmark}</p>
                                                            )}
                                                        </div>
                                                        {address.isDefault && (
                                                            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-bold">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200/50">
                                    <button
                                        onClick={() => {
                                            setShowUserDetails(false)
                                            setSelectedUser(null)
                                        }}
                                        className="group relative px-6 py-3 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleEditUser(currentUser)}
                                        className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                                    >
                                        Edit User
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-lg text-gray-600">Loading user details...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modern Edit User Modal */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 border border-white/20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                                    <Edit className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">Edit User</h3>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-lg"
                                />
                            </div>

                            <div className="flex items-center p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl border border-green-100/50">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editForm.isActive}
                                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="ml-3 text-sm font-bold text-gray-700">
                                    Active User
                                </label>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="group relative px-6 py-3 text-sm font-bold text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="group relative px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
