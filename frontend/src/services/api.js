import serverStatus from '../utils/serverStatus';
import config from '../config/production';

// https://homelineteam-19e5.vercel.app
class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL || "https://homelineteam.com/api";
    this.timeout = config.REQUEST_TIMEOUT;
    this.maxRetries = config.MAX_RETRY_ATTEMPTS;
    this.cache = new Map();
    this.cacheDuration = config.CACHE_DURATION;
    this.token = null;
  }

  // Set token for Authorization header (fallback if cookies don't work)
  setToken(token) {
    this.token = token;
  }

  // Get token from localStorage (fallback)
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || this.token;
    }
    return this.token;
  }

  // Store token in localStorage (fallback)
  storeToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  // Clear token
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}, retryCount = 0) {
    // Check cache first for GET requests
    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    if (options.method === 'GET' || !options.method) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Skip server status check in production to prevent errors
    const isProduction = config.NODE_ENV === 'production';

    if (!isProduction) {
      // Check if server is online first (only in development)
      const isOnline = await serverStatus.getStatus();

      if (!isOnline) {
        const fallbackData = serverStatus.getFallbackData(endpoint);
        if (fallbackData) {
          return fallbackData;
        }
      }
    }

    const url = `${this.baseURL}${endpoint}`;

    // Get token for Authorization header (fallback if cookies don't work)
    const token = this.getToken();

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Try to get error message from response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
        }

        const error = new Error(errorMessage);
        error.response = { data: { message: errorMessage } };
        throw error;
      }

      const data = await response.json();

      // Cache successful GET responses
      if (options.method === 'GET' || !options.method) {
        this.setCachedData(cacheKey, data);
      }

      return data;
    } catch (error) {
      // Retry logic for network errors
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, config.RETRY_DELAY));
        return this.request(endpoint, options, retryCount + 1);
      }

      // Try fallback data if available
      const fallbackData = serverStatus.getFallbackData(endpoint);
      if (fallbackData) {
        return fallbackData;
      }

      // Return a structured error response as last resort
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  shouldRetry(error) {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.name === 'AbortError' || // Timeout
      error.name === 'TypeError' || // Network error
      (error.message && error.message.includes('5'))
    );
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Admin Authentication methods
  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token if provided in response (fallback)
    if (response.token) {
      this.storeToken(response.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/api/auth/logout', {
      method: 'POST',
    });

    // Clear stored token
    this.clearToken();

    return response;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // User Authentication methods
  async registerUser(userData) {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyUserEmail(email, otp) {
    return this.request('/api/users/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resendUserEmailOTP(email) {
    return this.request('/api/users/resend-email-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async loginUser(credentials) {
    const response = await this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token if provided in response (fallback)
    if (response.token) {
      this.storeToken(response.token);
    }

    return response;
  }

  async logoutUser() {
    const response = await this.request('/api/users/logout', {
      method: 'POST',
    });

    // Clear stored token
    this.clearToken();

    return response;
  }

  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async addUserAddress(addressData) {
    return this.request('/api/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateUserAddress(addressId, addressData) {
    return this.request(`/api/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteUserAddress(addressId) {
    return this.request(`/api/users/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async forgotUserPassword(email) {
    return this.request('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetUserPassword(email, token, newPassword) {
    return this.request('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  }

  // Categories
  async getCategories() {
    return this.request('/api/categories');
  }

  async getMainCategories() {
    return this.request('/api/main-categories');
  }

  async getSubcategories(mainCategoryId) {
    return this.request(`/api/sub-categories?mainCategoryId=${mainCategoryId}`);
  }

  async getSubcategoriesByMainCategoryName(mainCategoryName) {
    return this.request(`/api/sub-categories/by-main-category/${mainCategoryName}`);
  }

  async getHierarchicalCategories() {
    return this.request('/api/categories/hierarchical');
  }

  async getCategoriesWithMainCategory() {
    return this.request('/api/categories/with-main-category');
  }

  async getCategoryById(id) {
    return this.request(`/api/categories/id/${id}`);
  }

  async getCategoryBySlug(slug) {
    return this.request(`/api/categories/${slug}`);
  }

  async getCategoryFilterOptions(slug) {
    return this.request(`/api/categories/${slug}/filter-options`);
  }

  // Products
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/products?${queryString}` : '/api/products';
    return this.request(endpoint);
  }

  async getProductBySlug(slug) {
    return this.request(`/api/products/${slug}`);
  }

  async getRelatedProducts(slug, limit = 8) {
    return this.request(`/api/products/${slug}/related?limit=${limit}`);
  }

  async getProductsByCategory(categoryId, params = {}) {
    // Convert complex objects to JSON strings for backend
    const processedParams = { ...params };

    if (params.priceRange) {
      processedParams.priceRange = JSON.stringify(params.priceRange);
    }
    if (params.brands && Array.isArray(params.brands)) {
      processedParams.brands = JSON.stringify(params.brands);
    }
    if (params.ratings && Array.isArray(params.ratings)) {
      processedParams.ratings = JSON.stringify(params.ratings);
    }
    if (params.availability && Array.isArray(params.availability)) {
      processedParams.availability = JSON.stringify(params.availability);
    }

    // Handle dynamic filters
    Object.keys(params).forEach(key => {
      if (key !== 'priceRange' && key !== 'brands' && key !== 'ratings' && key !== 'availability' && key !== 'sort' && key !== 'limit') {
        if (Array.isArray(params[key])) {
          processedParams[key] = JSON.stringify(params[key]);
        }
      }
    });

    // Use subcategoryId for the new hierarchical structure
    const queryString = new URLSearchParams({ subcategoryId: categoryId, ...processedParams }).toString();

    return this.request(`/api/products?${queryString}`);
  }

  async getProductsByMainCategory(mainCategoryId, params = {}) {
    // Convert complex objects to JSON strings for backend
    const processedParams = { ...params };

    if (params.priceRange) {
      processedParams.priceRange = JSON.stringify(params.priceRange);
    }
    if (params.brands && Array.isArray(params.brands)) {
      processedParams.brands = JSON.stringify(params.brands);
    }
    if (params.ratings && Array.isArray(params.ratings)) {
      processedParams.ratings = JSON.stringify(params.ratings);
    }
    if (params.availability && Array.isArray(params.availability)) {
      processedParams.availability = JSON.stringify(params.availability);
    }

    // Handle dynamic filters
    Object.keys(params).forEach(key => {
      if (key !== 'priceRange' && key !== 'brands' && key !== 'ratings' && key !== 'availability' && key !== 'sort' && key !== 'limit') {
        if (Array.isArray(params[key])) {
          processedParams[key] = JSON.stringify(params[key]);
        }
      }
    });

    // Use mainCategoryId for filtering by main category
    const queryString = new URLSearchParams({ mainCategoryId, ...processedParams }).toString();

    return this.request(`/api/products?${queryString}`);
  }

  async getFeaturedProducts(limit = 8) {
    try {
      // Try to get featured products first
      const featured = await this.request(`/api/products?featured=true&limit=${limit}`);
      if (featured && Array.isArray(featured) && featured.length > 0) {
        return featured;
      }

      // Fallback to getting latest products with limit
      const latest = await this.request(`/api/products?limit=${limit}`);
      return latest || [];
    } catch (error) {
      // Final fallback - get all products and limit on frontend
      try {
        const allProducts = await this.request('/api/products');
        return Array.isArray(allProducts) ? allProducts.slice(0, limit) : [];
      } catch (fallbackError) {
        return [];
      }
    }
  }

  // Search
  async searchProducts(query, params = {}) {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/api/products/search?${searchParams}`);
  }

  // Leads
  async createLead(payload) {
    return this.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    }, 0); // Disable retries for lead submissions to prevent duplicates
  }

  async getLeads() {
    return this.request('/api/leads');
  }

  // Collections
  async getCollections() {
    // For now, we'll use categories as collections
    return this.request('/api/categories');
  }

  // Orders
  async createOrder(orderData) {
    return this.request('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getUserOrders(userId) {
    return this.request(`/api/orders/user/${userId}`);
  }

  async getOrderById(orderId) {
    return this.request(`/api/orders/user-order/${orderId}`);
  }

  // Hero Section
  async getHeroSection() {
    return this.request('/api/hero-section');
  }

  async updateHeroSection(heroData) {
    return this.request('/api/hero-section', {
      method: 'PUT',
      body: JSON.stringify(heroData),
    });
  }

  async uploadHeroImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return fetch(`${this.baseURL}/api/hero-section/upload-image`, {
      method: 'POST',
      body: formData,
    }).then(response => response.json());
  }

  // Utility methods
  async getProductVariants(productId) {
    const product = await this.getProductBySlug(productId);
    return product.variants || [];
  }

  async getCategoryProducts(categorySlug, params = {}) {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) throw new Error('Category not found');

    return this.getProductsByCategory(category._id, params);
  }

  async getSubcategoryProducts(subcategorySlug, mainCategorySlug, params = {}) {
    const category = await this.getCategoryBySlug(subcategorySlug);
    if (!category) throw new Error('Subcategory not found');

    // Add mainCategorySlug to params for hierarchical validation
    const paramsWithMainCategory = {
      ...params,
      mainCategorySlug
    };

    return this.getProductsByCategory(category._id, paramsWithMainCategory);
  }

  // Return/Exchange API methods
  async createReturnRequest(returnData) {
    return this.request('/api/returns', {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  }

  async getUserReturns(status = null, type = null) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (type) params.append('type', type);

    const queryString = params.toString();
    return this.request(`/api/returns/my-returns${queryString ? `?${queryString}` : ''}`);
  }

  async getReturnById(returnId) {
    return this.request(`/api/returns/${returnId}`);
  }

  async updateReturnRequest(returnId, updateData) {
    return this.request(`/api/returns/${returnId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async cancelReturnRequest(returnId) {
    return this.request(`/api/returns/${returnId}/cancel`, {
      method: 'PATCH',
    });
  }
}

const apiService = new ApiService();
export default apiService;
