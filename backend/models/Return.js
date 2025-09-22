const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedOptions: { type: mongoose.Schema.Types.Mixed }, // selected variant fields
    image: { type: String },
    reason: {
        type: String,
        required: true,
        enum: [
            'defective',
            'wrong_item',
            'not_as_described',
            'damaged_shipping',
            'changed_mind',
            'wrong_size',
            'quality_issue',
            'other'
        ]
    },
    description: { type: String, required: true },
    condition: {
        type: String,
        required: true,
        enum: ['new', 'used', 'damaged', 'defective']
    }
}, { _id: false });

const returnSchema = new mongoose.Schema({
    // User reference
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Order reference
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    // Return/Exchange type
    type: {
        type: String,
        required: true,
        enum: ['return', 'exchange'],
        default: 'return'
    },

    // Items to return/exchange
    items: [returnItemSchema],

    // Exchange details (only for exchange type)
    exchangeItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: false
        },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        selectedOptions: { type: mongoose.Schema.Types.Mixed },
        image: { type: String }
    }],

    // Status tracking
    status: {
        type: String,
        required: true,
        enum: [
            'pending',           // Request submitted, awaiting admin review
            'approved',          // Admin approved the return/exchange
            'rejected',          // Admin rejected the request
            'processing',        // Return/exchange is being processed
            'shipped',           // Return items shipped back (for exchange)
            'received',          // Return items received by store
            'completed',         // Return/exchange completed
            'cancelled'          // Customer or admin cancelled
        ],
        default: 'pending'
    },

    // Refund details
    refund: {
        amount: { type: Number, default: 0 },
        method: {
            type: String,
            enum: ['original_payment', 'store_credit', 'bank_transfer', 'cash'],
            default: 'original_payment'
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        transactionId: { type: String },
        processedAt: { type: Date }
    },

    // Exchange details
    exchange: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'completed'],
            default: 'pending'
        },
        trackingNumber: { type: String },
        estimatedDelivery: { type: Date },
        deliveredAt: { type: Date }
    },

    // Shipping details for return
    returnShipping: {
        method: { type: String },
        trackingNumber: { type: String },
        carrier: { type: String },
        cost: { type: Number, default: 0 },
        shippedAt: { type: Date },
        deliveredAt: { type: Date }
    },

    // Customer details
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
    },

    // Admin notes and comments
    adminNotes: { type: String },
    customerNotes: { type: String },

    // Timestamps
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    completedAt: { type: Date },

    // Return policy compliance
    withinPolicy: { type: Boolean, default: true },
    policyViolationReason: { type: String },

    // Images for return items
    images: [{
        url: { type: String, required: true },
        caption: { type: String },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
returnSchema.index({ user: 1, status: 1 });
returnSchema.index({ order: 1 });
returnSchema.index({ status: 1 });
returnSchema.index({ requestedAt: -1 });

// Virtual for total refund amount
returnSchema.virtual('totalRefundAmount').get(function () {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Virtual for total exchange value
returnSchema.virtual('totalExchangeValue').get(function () {
    if (this.type === 'exchange' && this.exchangeItems.length > 0) {
        return this.exchangeItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    return 0;
});

// Method to check if return is within policy (30 days)
returnSchema.methods.isWithinPolicy = function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.requestedAt >= thirtyDaysAgo;
};

// Method to update status with timestamp
returnSchema.methods.updateStatus = function (newStatus) {
    this.status = newStatus;
    const now = new Date();

    switch (newStatus) {
        case 'approved':
            this.approvedAt = now;
            break;
        case 'rejected':
            this.rejectedAt = now;
            break;
        case 'completed':
            this.completedAt = now;
            break;
    }

    return this.save();
};

module.exports = mongoose.model('Return', returnSchema);


