const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
exports.authenticateUser = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.user_token) {
            token = req.cookies.user_token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

        // Check if user exists and is active
        const user = await User.findById(decoded.sub).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found or inactive.'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        next(error);
    }
};

// Optional authentication middleware (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies && req.cookies.user_token) {
            token = req.cookies.user_token;
        }

        if (token) {
            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

                // Check if user exists and is active
                const user = await User.findById(decoded.sub).select('-password');
                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Token is invalid, but we don't fail the request
            }
        }

        next();

    } catch (error) {
        next(error);
    }
};
