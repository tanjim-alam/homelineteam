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
      const res = await api.get('/api/leads')
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Interior Design Leads</h2>
          <p className="text-gray-600 mt-1">Manage and track all design inquiries</p>
        </div>
        <button
          onClick={fetchLeads}
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading leads...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800 font-medium">Error loading leads</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600">Interior design leads will appear here when customers submit forms.</p>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="space-y-4">
          {leads.map((lead, index) => {
            const selectedProduct = formatSelectedProduct(lead.meta)
            const isExpanded = expandedLead === lead._id

            return (
              <div key={lead._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                {/* Lead Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpanded(lead._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${lead.phone}`} className="hover:text-blue-600">{lead.phone}</a>
                          </div>
                          {lead.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {lead.city}
                            </div>
                          )}
                          {lead.homeType && (
                            <div className="flex items-center gap-1">
                              <Home className="w-4 h-4" />
                              {lead.homeType}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{lead.sourcePage || 'Unknown'}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Contact Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Name:</span> {lead.name}</div>
                          <div><span className="font-medium">Phone:</span> <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a></div>
                          <div><span className="font-medium">City:</span> {lead.city || 'Not specified'}</div>
                          <div><span className="font-medium">Home Type:</span> {lead.homeType || 'Not specified'}</div>
                          <div><span className="font-medium">Source:</span> {lead.sourcePage || 'Unknown'}</div>
                          <div><span className="font-medium">Message:</span> {lead.message || 'No message'}</div>
                          <div><span className="font-medium">Submitted:</span> {new Date(lead.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Selected Product Details */}
                      {selectedProduct && (
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Selected Product Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Product Name:</span> {selectedProduct.name}</div>
                            <div><span className="font-medium">Price:</span> {selectedProduct.price}</div>
                            {selectedProduct.layout !== 'Not specified' && (
                              <div><span className="font-medium">Layout:</span> {selectedProduct.layout}</div>
                            )}
                            {selectedProduct.materials !== 'Not specified' && (
                              <div><span className="font-medium">Materials:</span> {selectedProduct.materials}</div>
                            )}
                            {selectedProduct.type !== 'Not specified' && (
                              <div><span className="font-medium">Type:</span> {selectedProduct.type}</div>
                            )}
                            {selectedProduct.doors !== 'Not specified' && (
                              <div><span className="font-medium">Doors:</span> {selectedProduct.doors}</div>
                            )}
                            {selectedProduct.kitchenLayout !== 'Not specified' && (
                              <div><span className="font-medium">Kitchen Layout:</span> {selectedProduct.kitchenLayout}</div>
                            )}
                            {selectedProduct.wardrobe1Type !== 'Not specified' && (
                              <div><span className="font-medium">Wardrobe 1 Type:</span> {selectedProduct.wardrobe1Type}</div>
                            )}
                            {selectedProduct.wardrobe2Type !== 'Not specified' && (
                              <div><span className="font-medium">Wardrobe 2 Type:</span> {selectedProduct.wardrobe2Type}</div>
                            )}
                            <div><span className="font-medium">Product ID:</span> {selectedProduct.id}</div>
                            {selectedProduct.image && (
                              <div className="mt-3">
                                <span className="font-medium">Product Image:</span>
                                <div className="mt-2">
                                  <a
                                    href={selectedProduct.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                  >
                                    <img
                                      src={selectedProduct.image}
                                      alt="Product"
                                      className="w-32 h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
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
  )
}


