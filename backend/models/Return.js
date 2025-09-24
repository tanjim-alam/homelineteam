const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['return', 'exchange'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'processing', 'shipped', 'received', 'completed', 'cancelled'],
        default: 'pending'
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        reason: {
            type: String,
            required: true
        },
        condition: {
            type: String,
            enum: ['new', 'used', 'damaged'],
            default: 'used'
        }
    }],
    exchangeItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    customerNotes: {
        type: String,
        maxlength: 500
    },
    adminNotes: {
        type: String,
        maxlength: 500
    },
    images: [{
        url: String,
        publicId: String
    }],
    refund: {
        method: {
            type: String,
            enum: ['original_payment', 'store_credit', 'bank_transfer'],
            default: 'original_payment'
        },
        amount: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        transactionId: String,
        processedAt: Date,
        completedAt: Date
    },
    returnShipping: {
        trackingNumber: String,
        carrier: String,
        shippedAt: Date,
        deliveredAt: Date,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String
        }
    },
    bankAccount: {
        accountHolderName: {
            type: String,
            required: function () {
                return this.type === 'return' && this.refund && this.refund.method === 'bank_transfer';
            }
        },
        accountNumber: {
            type: String,
            required: function () {
                return this.type === 'return' && this.refund && this.refund.method === 'bank_transfer';
            }
        },
        bankName: {
            type: String,
            required: function () {
                return this.type === 'return' && this.refund && this.refund.method === 'bank_transfer';
            }
        },
        ifscCode: {
            type: String,
            required: function () {
                return this.type === 'return' && this.refund && this.refund.method === 'bank_transfer';
            }
        },
        branchName: String,
        accountType: {
            type: String,
            enum: ['savings', 'current'],
            default: 'savings'
        }
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: function () {
                return this.type === 'return';
            }
        },
        phone: {
            type: String,
            required: function () {
                return this.type === 'return';
            }
        },
        address: {
            type: String,
            required: function () {
                return this.type === 'return';
            }
        },
        city: {
            type: String,
            required: function () {
                return this.type === 'return';
            }
        },
        state: {
            type: String,
            required: function () {
                return this.type === 'return';
            }
        },
        zipCode: {
            type: String,
            required: function () {
                return this.type === 'return';
            }
        },
        country: {
            type: String,
            required: function () {
                return this.type === 'return';
            },
            default: 'India'
        },
        landmark: String,
        addressType: {
            type: String,
            enum: ['home', 'office', 'other'],
            default: 'home'
        }
    },
    timestamps: {
        requestedAt: {
            type: Date,
            default: Date.now
        },
        approvedAt: Date,
        rejectedAt: Date,
        completedAt: Date
    }
}, {
    timestamps: true
});

// Index for better query performance
returnSchema.index({ user: 1, status: 1 });
returnSchema.index({ order: 1 });
returnSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Return', returnSchema);
