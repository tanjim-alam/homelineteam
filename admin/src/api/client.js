import axios from 'axios';
import config from '../config/config';


const api = axios.create({
  baseURL: config.API_BASE_URL || "https://homelineteam-19e5.vercel.app",
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  },
  timeout: config.DEFAULTS.TIMEOUT.API_REQUEST,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Handle FormData properly
    if (config.data instanceof FormData) {
      // For FormData, let the browser set the Content-Type with boundary
      // Remove any manually set Content-Type to avoid conflicts
      delete config.headers['Content-Type'];
    }

    // Add token from localStorage as fallback if cookies don't work
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;


