// Development configuration for backend
module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://homeline:homeline123@cluster0.symdr6d.mongodb.net/homelineteam',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',

    // CORS Configuration - More permissive for development
    CORS_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:4173',
        // Allow all Vercel domains
        'https://homelineteams.vercel.app',
        'https://homelineteams-git-main-tanjims-projects-af087137.vercel.app',
        'https://homelineteams.com',
        'https://www.homelineteams.com',
        // HTTP versions (for development/preview)
        "http://homelineteam-admin.vercel.app",
        "http://www.homelineteam-admin.vercel.app",
        "http://homelineteam.vercel.app",
        "http://www.homelineteam.vercel.app",
        // HTTPS versions (for production)
        "https://homelineteam-admin.vercel.app",
        "https://www.homelineteam-admin.vercel.app",
        "https://homelineteam.vercel.app",
        "https://www.homelineteam.vercel.app"
    ],

    // Rate Limiting - More lenient for development
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 1000, // More requests allowed in development

    // Security
    BCRYPT_ROUNDS: 10, // Faster for development
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-session-secret',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',

    // Performance
    REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_REQUEST_SIZE: '10mb',

    // Error Handling
    SHOW_STACK_TRACE: true
};
