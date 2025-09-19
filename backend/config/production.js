// Production configuration for backend
module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'production',

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://homeline:homeline123@cluster0.symdr6d.mongodb.net/homelineteam',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'your-api-key',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',

    // Email Configuration
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
    EMAIL_USER: process.env.EMAIL_USER || 'tanjim11alam@gmail.com',
    EMAIL_PASS: process.env.EMAIL_PASS || 'heomrbwqxaaxhppj',
    EMAIL_FROM: process.env.EMAIL_FROM || 'tanjim11alam@gmail.com',
    EMAIL_TO: process.env.EMAIL_TO || 'tanjim.seo@gmail.com',

    // CORS Configuration
    CORS_ORIGINS: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4173',
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
        "https://www.homelineteam.vercel.app",
        // Vercel preview URLs pattern
        "https://homelineteam-git-*.vercel.app",
        "https://homelineteam-admin-git-*.vercel.app",
        "https://homelineteams-git-*.vercel.app",
        "http://homelineteam-git-*.vercel.app",
        "http://homelineteam-admin-git-*.vercel.app",
        "http://homelineteams-git-*.vercel.app"
    ],

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs

    // Security
    BCRYPT_ROUNDS: 12,
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    // Performance
    REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_REQUEST_SIZE: '10mb',

    // Error Handling
    SHOW_STACK_TRACE: process.env.NODE_ENV !== 'production'
};
