const multer = require('multer');

// Use memory storage so files go directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image uploads are allowed'));
  }
};

// 🔹 Single file upload (generic)
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("image");

// 🔹 Multiple files upload (generic)
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).array("images", 10);

// 🔹 Category upload (main image + OG image + text fields)
const uploadCategory = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: "image", maxCount: 1 },
  { name: "metaData[ogImage]", maxCount: 1 }
]);

// 🔹 Category text-only upload (for metadata updates without files)
const uploadCategoryText = (req, res, next) => {
  // For text-only updates, we don't need multer
  // The text fields will be available in req.body
  next();
};

// 🔹 Product upload (multiple images + OG image)
const uploadProduct = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'metaData[ogImage]', maxCount: 1 }
]); // Use .fields() to handle specific file fields

// 🔹 Product text-only upload (for updates without files)
const uploadProductText = (req, res, next) => {
  // For text-only updates, we don't need multer
  // The text fields will be available in req.body
  next();
};

// 🔹 Document upload for delivery partners (multiple document types)
const uploadDocuments = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs for documents
    if (file.mimetype && (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed for documents'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for documents
}).fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'vehicleRegistration', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 }
]);

// 🔹 Debugging middleware (optional)
const debugUpload = (req, res, next) => {
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadCategory,
  uploadCategoryText,
  uploadProduct,
  uploadProductText,
  uploadDocuments,
  debugUpload
};
