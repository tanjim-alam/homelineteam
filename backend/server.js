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
const PORT = config.PORT || 5000;


app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Origin"); // 🔥 critical for CORS
  next();
});

const allowedOrigins = config.CORS_ORIGINS || [
  'https://homelineteam.com',
  'https://www.homelineteam.com',
  'https://admin.homelineteam.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: config.MAX_REQUEST_SIZE }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});


app.use('/auth', authLimiter, require('./routes/auth.routes'));
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


app.use(notFoundHandler);
app.use(errorHandler);


connectDatabase().then(() => {
  configureCloudinary();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(() => process.exit(1));