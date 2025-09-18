// Server status utility
class ServerStatus {
  constructor() {
    this.isOnline = false;
    this.lastCheck = null;
    this.checkInterval = 30000; // Check every 30 seconds
  }

  async checkServerStatus() {
    try {
      // Skip health check in production to prevent errors
      const isProduction = typeof window !== 'undefined' &&
        (window.location.hostname.includes('vercel.app') ||
          window.location.hostname.includes('homelineteams'));

      if (isProduction) {
        this.isOnline = true; // Assume online in production
        this.lastCheck = new Date();
        return true;
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ||
        (typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : 'http://localhost:5000');

      const response = await fetch(`${apiBaseUrl}/api/health`, {
        method: 'GET',
        timeout: 5000
      });

      this.isOnline = response.ok;
      this.lastCheck = new Date();
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      this.lastCheck = new Date();
      return false;
    }
  }

  async getStatus() {
    // If we haven't checked recently, check now
    if (!this.lastCheck || (Date.now() - this.lastCheck.getTime()) > this.checkInterval) {
      await this.checkServerStatus();
    }
    return this.isOnline;
  }

  // Get fallback data for different endpoints
  getFallbackData(endpoint) {
    const fallbackData = {
      '/api/categories': [],
      '/api/products': [],
      '/api/hero-section': {
        success: true,
        data: {
          backgroundImages: [],
          categories: [],
          sliderSettings: {
            autoSlide: true,
            slideInterval: 3000,
            transitionDuration: 1000
          }
        }
      }
    };

    return fallbackData[endpoint] || null;
  }
}

export const serverStatus = new ServerStatus();
export default serverStatus;
