import serverStatus from '../utils/serverStatus';
import config from '../config/production';

class ApiService {
  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.timeout = config.REQUEST_TIMEOUT;
    this.maxRetries = config.MAX_RETRY_ATTEMPTS;
    this.cache = new Map();
    this.cacheDuration = config.CACHE_DURATION;
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
    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
        throw new Error(`HTTP error! status: ${response.status}`);
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

  // Categories
  async getCategories() {
    return this.request('/api/categories');
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

    const queryString = new URLSearchParams({ categoryId, ...processedParams }).toString();

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
    });
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
}

const apiService = new ApiService();
export default apiService;
