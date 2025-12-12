// Production configuration for backend
module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 5000,
    NODE_ENV: 'production',

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI,

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: '7d',

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // Email Configuration
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_TO: process.env.EMAIL_TO,

    // CORS Configuration — ONLY REAL DOMAIN
    CORS_ORIGINS: [
        "https://homelineteam.com",
        "https://www.homelineteam.com",
        "https://homelineteam.com/admin",
        "https://www.homelineteam.com/admin"
    ],

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
    RATE_LIMIT_MAX_REQUESTS: 200,

    // Security
    BCRYPT_ROUNDS: 12,
    SESSION_SECRET: process.env.SESSION_SECRET,

    // Logging
    LOG_LEVEL: "info",

    // Performance
    REQUEST_TIMEOUT: 30000,
    MAX_REQUEST_SIZE: "10mb",

    // Error Handling
    SHOW_STACK_TRACE: false
};
