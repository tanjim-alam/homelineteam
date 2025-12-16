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
const { uploadProduct, uploadCategory, uploadSingle } = require('./middlewares/upload.middleware');

// Routes
const categoryRoutes = require('./routes/category.routes');
const mainCategoryRoutes = require('./routes/mainCategory.routes');
const productRoutes = require('./routes/product.routes');
const kitchenProductRoutes = require('./routes/kitchenProduct.routes');
const wardrobeProductRoutes = require('./routes/wardrobeProduct.routes');
const oneBHKPackageRoutes = require('./routes/oneBHKPackage.routes');
const twoBHKPackageRoutes = require('./routes/twoBHKPackage.routes');
const deliveryPartnerRoutes = require('./routes/deliveryPartner.routes');
const orderRoutes = require('./routes/order.routes');
const heroSectionRoutes = require('./routes/heroSection.routes');
const leadRoutes = require('./routes/lead.routes');
const userRoutes = require('./routes/user.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const returnRoutes = require('./routes/return.routes');

// Middlewares
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.set('trust-proxy', 1);

// CORS configuration - must be first
const allowedOrigins = [
	'https://homelineteam.com',
	'https://www.homelineteam.com',
	'https://admin.homelineteam.com',
	'https://wwww.admin.homelineteam.com'
];

const corsOptions = {
	origin: function (origin, callback) {

		// Allow server-to-server, Postman, curl, mobile apps
		if (!origin) return callback(null, true);

		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		callback(new Error("Not allowed by CORS: " + origin));
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
	exposedHeaders: ['Set-Cookie', 'Authorization']
};

app.use(cors(corsOptions));

// CORS preflight handling - simplified approach
app.use((req, res, next) => {
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
		res.header('Access-Control-Allow-Credentials', 'true');
		return res.status(200).end();
	}
	next();
});

// Security & misc
app.use(helmet());
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
app.get('/health', (req, res) => {
	return res.json({ ok: true, service: 'homelineteam-backend', timestamp: new Date().toISOString() });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
	res.json({
		message: 'CORS test successful',
		origin: req.headers.origin,
		method: req.method,
		timestamp: new Date().toISOString()
	});
});

// CORS test PATCH endpoint
app.patch('/cors-test', (req, res) => {
	res.json({
		message: 'CORS PATCH test successful',
		origin: req.headers.origin,
		method: req.method,
		body: req.body,
		timestamp: new Date().toISOString()
	});
});







// Environment check endpoint
app.get('/env-check', (req, res) => {
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
app.use('/auth', authLimiter, authRoutes);
app.use('/users', authLimiter, userRoutes);
app.use('/categories', categoryRoutes);
app.use('/main-categories', mainCategoryRoutes);
app.use('/products', productRoutes);
app.use('/kitchen-products', kitchenProductRoutes);
app.use('/wardrobe-products', wardrobeProductRoutes);
app.use('/1bhk-packages', oneBHKPackageRoutes);
app.use('/2bhk-packages', twoBHKPackageRoutes);
app.use('/delivery-partners', deliveryPartnerRoutes);
app.use('/orders', orderRoutes);

app.use('/hero-section', heroSectionRoutes);
app.use('/leads', leadRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/returns', returnRoutes);

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


