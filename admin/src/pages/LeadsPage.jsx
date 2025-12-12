import { useEffect, useState } from 'react'
import api from '../api/client'
import { ChevronDown, ChevronRight, Phone, MapPin, Home, Calendar, MessageSquare, Package, RefreshCw } from 'lucide-react'

export default function LeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedLead, setExpandedLead] = useState(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/leads')
      setLeads(res.data || [])
    } catch (e) {
      setError(e.message || 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }


  const formatSelectedProduct = (meta) => {
    if (!meta?.selectedProduct) return null

    const product = meta.selectedProduct
    return {
      name: product.name || 'Not specified',
      price: product.basePrice ? `₹${product.basePrice.toLocaleString()}` : 'Not specified',
      layout: product.layout?.name || product.layout || 'Not specified',
      materials: product.materials ?
        (Array.isArray(product.materials) ?
          product.materials.map(m => m.material).join(', ') :
          product.materials) : 'Not specified',
      type: product.type || 'Not specified',
      doors: product.doors || 'Not specified',
      kitchenLayout: product.kitchenLayout || 'Not specified',
      wardrobe1Type: product.wardrobe1Type || 'Not specified',
      wardrobe2Type: product.wardrobe2Type || 'Not specified',
      image: product.image || null,
      id: product.id || 'Not specified'
    }
  }


  const toggleExpanded = (leadId) => {
    setExpandedLead(expandedLead === leadId ? null : leadId)
  }

  useEffect(() => { fetchLeads() }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Modern Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                Interior Design Leads
              </h1>
              <p className="text-lg text-gray-600">Manage and track all design inquiries</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchLeads}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Leads
              </button>
            </div>
          </div>
        </div>

        {/* Modern Loading State */}
        {loading && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-600 font-medium">Loading leads...</span>
            </div>
          </div>
        )}

        {/* Modern Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Error loading leads</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Empty State */}
        {!loading && !error && leads.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No leads found</h3>
            <p className="text-lg text-gray-600">Interior design leads will appear here when customers submit forms.</p>
          </div>
        )}

        {/* Modern Leads List */}
        {!loading && !error && leads.length > 0 && (
          <div className="space-y-6">
            {leads.map((lead, index) => {
              const selectedProduct = formatSelectedProduct(lead.meta)
              const isExpanded = expandedLead === lead._id

              return (
                <div key={lead._id} className="bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-3xl shadow-xl hover:shadow-2xl hover:bg-white/70 transition-all duration-300 transform hover:scale-[1.02]">
                  {/* Modern Lead Header */}
                  <div
                    className="p-8 cursor-pointer"
                    onClick={() => toggleExpanded(lead._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">{lead.name}</h3>
                          <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl px-3 py-2 border border-blue-100/50">
                              <Phone className="w-4 h-4 text-blue-600" />
                              <a href={`tel:${lead.phone}`} className="hover:text-blue-600 font-medium">{lead.phone}</a>
                            </div>
                            {lead.city && (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl px-3 py-2 border border-green-100/50">
                                <MapPin className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{lead.city}</span>
                              </div>
                            )}
                            {lead.homeType && (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl px-3 py-2 border border-purple-100/50">
                                <Home className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">{lead.homeType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl px-4 py-2 border border-amber-100/50">
                            {lead.sourcePage || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-gray-400 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                          {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200/50 p-8 bg-gradient-to-r from-gray-50/50 to-blue-50/50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Modern Contact Information */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                              Contact Details
                            </h4>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">Name:</span>
                              <span className="text-gray-900 font-semibold">{lead.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">Phone:</span>
                              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline font-semibold">{lead.phone}</a>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">City:</span>
                              <span className="text-gray-900 font-semibold">{lead.city || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">Home Type:</span>
                              <span className="text-gray-900 font-semibold">{lead.homeType || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">Source:</span>
                              <span className="text-gray-900 font-semibold">{lead.sourcePage || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">Message:</span>
                              <span className="text-gray-900 font-semibold">{lead.message || 'No message'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-700">Submitted:</span>
                              <span className="text-gray-900 font-semibold">{new Date(lead.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Modern Selected Product Details */}
                        {selectedProduct && (
                          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-200 rounded-2xl flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                              </div>
                              <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                                Selected Product Details
                              </h4>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">Product Name:</span>
                                <span className="text-gray-900 font-semibold">{selectedProduct.name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">Price:</span>
                                <span className="text-green-600 font-bold text-lg">{selectedProduct.price}</span>
                              </div>
                              {selectedProduct.layout !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Layout:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.layout}</span>
                                </div>
                              )}
                              {selectedProduct.materials !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Materials:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.materials}</span>
                                </div>
                              )}
                              {selectedProduct.type !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Type:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.type}</span>
                                </div>
                              )}
                              {selectedProduct.doors !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Doors:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.doors}</span>
                                </div>
                              )}
                              {selectedProduct.kitchenLayout !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Kitchen Layout:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.kitchenLayout}</span>
                                </div>
                              )}
                              {selectedProduct.wardrobe1Type !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Wardrobe 1 Type:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.wardrobe1Type}</span>
                                </div>
                              )}
                              {selectedProduct.wardrobe2Type !== 'Not specified' && (
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-gray-700">Wardrobe 2 Type:</span>
                                  <span className="text-gray-900 font-semibold">{selectedProduct.wardrobe2Type}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-700">Product ID:</span>
                                <span className="text-gray-900 font-semibold">{selectedProduct.id}</span>
                              </div>
                              {selectedProduct.image && (
                                <div className="mt-6">
                                  <span className="font-bold text-gray-700 block mb-3">Product Image:</span>
                                  <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 rounded-2xl p-4 border border-gray-200/50">
                                    <a
                                      href={selectedProduct.image}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-block hover:scale-105 transition-transform duration-200"
                                    >
                                      <img
                                        src={selectedProduct.image}
                                        alt="Product"
                                        className="w-40 h-32 object-cover rounded-xl border border-gray-200 hover:border-blue-300 transition-colors shadow-lg"
                                      />
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


