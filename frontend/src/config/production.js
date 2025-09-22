// Production configuration


// https://homelineteam-production.up.railway.app
export const config = {
  // API Configuration
  API_BASE_URL: "https://homelineteam-19e5.vercel.app" ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://homelineteam-19e5.vercel.app'),

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'production',

  // Feature Flags
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',

  // Performance
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds

  // Error Handling
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default config;


// process.env.NEXT_PUBLIC_API_BASE_URL 