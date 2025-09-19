const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },

    // Company Details
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        trim: true
    },
    gstNumber: {
        type: String,
        trim: true
    },

    // Contact Information
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    alternatePhone: {
        type: String,
        trim: true
    },

    // Address Information
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, default: 'India', trim: true }
    },

    // Service Areas
    serviceAreas: [{
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincodes: [String], // Array of pincodes covered
        isActive: { type: Boolean, default: true }
    }],

    // Service Details
    services: [{
        name: { type: String, required: true },
        description: String,
        basePrice: { type: Number, required: true },
        pricePerKm: { type: Number, default: 0 },
        minimumCharge: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    }],

    // Delivery Capabilities
    deliveryCapabilities: {
        maxWeight: { type: Number }, // in kg
        maxDimensions: {
            length: Number, // in cm
            width: Number,  // in cm
            height: Number  // in cm
        },
        vehicleTypes: [{
            type: { type: String, required: true }, // e.g., 'bike', 'car', 'truck', 'van'
            capacity: String,
            isAvailable: { type: Boolean, default: true }
        }],
        specialHandling: [String], // e.g., 'fragile', 'heavy', 'oversized'
        workingHours: {
            start: { type: String, default: '09:00' },
            end: { type: String, default: '18:00' },
            workingDays: [String] // ['monday', 'tuesday', etc.]
        }
    },

    // Performance Metrics
    performance: {
        averageDeliveryTime: { type: Number }, // in hours
        successRate: { type: Number, min: 0, max: 100 }, // percentage
        customerRating: { type: Number, min: 0, max: 5 },
        totalDeliveries: { type: Number, default: 0 },
        onTimeDeliveries: { type: Number, default: 0 }
    },

    // Financial Information
    pricing: {
        baseDeliveryFee: { type: Number, required: true },
        fuelSurcharge: { type: Number, default: 0 },
        additionalCharges: [{
            name: String,
            amount: Number,
            condition: String // e.g., 'weekend', 'holiday', 'urgent'
        }],
        paymentTerms: { type: String, default: 'COD' }, // 'COD', 'Prepaid', 'Both'
        billingCycle: { type: String, default: 'weekly' } // 'daily', 'weekly', 'monthly'
    },

    // Status and Availability
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended', 'pending_approval'],
        default: 'pending_approval'
    },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    // Documents
    documents: {
        panCard: String,
        aadharCard: String,
        drivingLicense: String,
        vehicleRegistration: String,
        insurance: String,
        gstCertificate: String,
        other: [String]
    },

    // Bank Details
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        branchName: String
    },

    // Commission and Payout
    commission: {
        type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        value: { type: Number, required: true }, // percentage or fixed amount
        minimumPayout: { type: Number, default: 0 }
    },

    // Metadata
    tags: [String],
    notes: String,

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date }
});

// Indexes for better query performance
deliveryPartnerSchema.index({ name: 'text', companyName: 'text', description: 'text' });
deliveryPartnerSchema.index({ status: 1, isAvailable: 1 });
deliveryPartnerSchema.index({ 'serviceAreas.city': 1, 'serviceAreas.state': 1 });
deliveryPartnerSchema.index({ email: 1 });
deliveryPartnerSchema.index({ phone: 1 });

// Pre-save middleware to update timestamps
deliveryPartnerSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Method to calculate success rate
deliveryPartnerSchema.methods.calculateSuccessRate = function () {
    if (this.performance.totalDeliveries === 0) return 0;
    return (this.performance.onTimeDeliveries / this.performance.totalDeliveries) * 100;
};

// Method to check if partner serves a specific area
deliveryPartnerSchema.methods.servesArea = function (city, state, pincode) {
    return this.serviceAreas.some(area =>
        area.isActive &&
        area.city.toLowerCase() === city.toLowerCase() &&
        area.state.toLowerCase() === state.toLowerCase() &&
        (area.pincodes.length === 0 || area.pincodes.includes(pincode))
    );
};

// Method to get available services
deliveryPartnerSchema.methods.getAvailableServices = function () {
    return this.services.filter(service => service.isActive);
};

// Method to calculate delivery cost
deliveryPartnerSchema.methods.calculateDeliveryCost = function (distance, weight, serviceType) {
    const service = this.services.find(s => s.name === serviceType && s.isActive);
    if (!service) return null;

    let cost = service.basePrice;
    if (service.pricePerKm > 0) {
        cost += distance * service.pricePerKm;
    }

    // Apply minimum charge
    if (service.minimumCharge > 0 && cost < service.minimumCharge) {
        cost = service.minimumCharge;
    }

    return cost;
};

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);






