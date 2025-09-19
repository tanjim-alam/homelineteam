// Configuration for the admin panel
export const config = {
    // API Configuration
    // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://homelineteam-production.up.railway.app',
    API_BASE_URL: 'https://homelineteam-production.up.railway.app',
    // App Configuration
    APP_NAME: import.meta.env.VITE_APP_NAME || 'HomeLine Admin',

    // Development Configuration
    IS_DEVELOPMENT: import.meta.env.DEV || false,

    // Feature Flags
    FEATURES: {
        DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
        ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
    },

    // API Endpoints
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            LOGOUT: '/api/auth/logout',
            ME: '/api/auth/me',
            REGISTER: '/api/auth/register',
        },
        CATEGORIES: '/api/categories',
        PRODUCTS: '/api/products',
        ORDERS: '/api/orders',
        HEALTH: '/api/health',
        CORS_TEST: '/api/cors-test',
    },

    // Default Values
    DEFAULTS: {
        PAGINATION: {
            PAGE_SIZE: 10,
            MAX_PAGE_SIZE: 100,
        },
        TIMEOUT: {
            API_REQUEST: 10000, // 10 seconds
            ERROR_DISMISS: 5000, // 5 seconds
        },
    },
}

export default config
