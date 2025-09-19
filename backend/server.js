const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = require(process.env.NODE_ENV === 'development' ? './config/development' : './config/production');
const connectDatabase = require('./config/db');
const { configureCloudinary } = require('./utils/cloudinary');
const { uploadProduct, debugUpload, uploadCategory, uploadSingle } = require('./middlewares/upload.middleware');

// Routes
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const kitchenProductRoutes = require('./routes/kitchenProduct.routes');
const wardrobeProductRoutes = require('./routes/wardrobeProduct.routes');
const oneBHKPackageRoutes = require('./routes/oneBHKPackage.routes');
const twoBHKPackageRoutes = require('./routes/twoBHKPackage.routes');
const deliveryPartnerRoutes = require('./routes/deliveryPartner.routes');
const orderRoutes = require('./routes/order.routes');
const heroSectionRoutes = require('./routes/heroSection.routes');
const leadRoutes = require('./routes/lead.routes');

// Middlewares
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Security & misc
// Security & misc
app.use(helmet());

// CORS configuration - simplified
const corsOptions = {
	origin: function (origin, callback) {

		// For requests with no origin (like mobile apps or curl requests), 
		// we need to be more specific when credentials are required
		if (!origin) {
			// Only allow no-origin requests in development
			if (process.env.NODE_ENV === 'development') {
				return callback(null, true);
			}
			// In production, allow no-origin for API testing
			return callback(null, true);
		}

		// In development, allow all localhost origins
		if (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
			return callback(null, true);
		}

		// Allow all Vercel domains
		if (origin.includes('vercel.app')) {
			return callback(null, true);
		}

		// Check if origin is in allowed list
		const allowedOrigins = config.CORS_ORIGINS;
		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		// Allow homelineteam domains
		if (origin.includes('homelineteam') && origin.includes('vercel.app')) {
			return callback(null, true);
		}

		// Allow localhost for development
		if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
			return callback(null, true);
		}

		// Allow all localhost ports for development
		if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
			return callback(null, true);
		}

		callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin'
	],
	exposedHeaders: ['Set-Cookie', 'Authorization'],
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: config.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
	windowMs: config.RATE_LIMIT_WINDOW_MS,
	max: config.RATE_LIMIT_MAX_REQUESTS
});

// Health check
app.get('/api/health', (req, res) => {
	return res.json({ ok: true, service: 'homelineteam-backend', timestamp: new Date().toISOString() });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
	res.json({
		message: 'CORS is working!',
		origin: req.get('origin'),
		userAgent: req.get('user-agent'),
		credentials: req.get('cookie') ? 'Cookies present' : 'No cookies',
		timestamp: new Date().toISOString()
	});
});

// Cookie test endpoint
app.get('/api/cookie-test', (req, res) => {
	const isProduction = process.env.NODE_ENV === 'production';
	const origin = req.get('origin') || '';
	const isVercel = origin.includes('vercel.app') || origin.includes('homelineteams.com');

	const cookieOptions = {
		httpOnly: true,
		secure: isProduction,
		sameSite: isVercel ? 'none' : 'lax',
		maxAge: 60 * 1000, // 1 minute
		path: '/',
	};

	res
		.cookie('test-cookie', 'test-value', cookieOptions)
		.json({
			message: 'Cookie test',
			origin,
			isProduction,
			isVercel,
			cookieOptions,
			existingCookies: req.cookies,
			timestamp: new Date().toISOString()
		});
});

// Kitchen products test endpoint
app.get('/api/kitchen-products-test', (req, res) => {
	res.json({
		message: 'Kitchen products endpoint is working!',
		origin: req.get('origin'),
		timestamp: new Date().toISOString()
	});
});

// File upload test endpoint
app.post('/api/test-upload', debugUpload, uploadProduct, (req, res) => {
	res.json({
		message: 'Upload test successful',
		files: req.files ? Object.keys(req.files) : 'No files',
		body: req.body
	});
});

// Hero section upload test endpoint
app.post('/api/test-hero-upload', uploadSingle, (req, res) => {
	res.json({
		message: 'Hero upload test successful',
		file: req.file ? {
			fieldname: req.file.fieldname,
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size
		} : 'No file'
	});
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
	res.json({
		cloudinary: {
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
			api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
			api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
		},
		node_env: process.env.NODE_ENV || 'Not set',
		port: process.env.PORT
	});
});

// API routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/kitchen-products', kitchenProductRoutes);
app.use('/api/wardrobe-products', wardrobeProductRoutes);
app.use('/api/1bhk-packages', oneBHKPackageRoutes);
app.use('/api/2bhk-packages', twoBHKPackageRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hero-section', heroSectionRoutes);
app.use('/api/leads', leadRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

connectDatabase().then(() => {
	configureCloudinary();
	app.listen(config.PORT, () => {
		// Server started successfully
	});
}).catch((error) => {
	process.exit(1);
});


