const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    homeType: { type: String, trim: true },
    sourcePage: { type: String, trim: true },
    message: { type: String, trim: true },
    meta: { type: Object },
    // Product details for interior design leads
    productDetails: {
      name: { type: String, trim: true },
      price: { type: Number },
      image: { type: String, trim: true },
      category: { type: String, trim: true },
      description: { type: String, trim: true }
    },
    status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', LeadSchema);


