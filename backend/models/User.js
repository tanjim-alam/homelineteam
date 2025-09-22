const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    emailVerificationExpires: {
        type: Date,
        default: null
    },
    phoneVerificationOTP: {
        type: String,
        default: null
    },
    phoneVerificationExpires: {
        type: Date,
        default: null
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    lastLogin: {
        type: Date,
        default: null
    },
    addresses: [{
        type: {
            type: String,
            enum: ['home', 'work', 'other'],
            default: 'home'
        },
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        landmark: {
            type: String
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token (6-digit OTP)
userSchema.methods.generateEmailVerificationToken = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.emailVerificationToken = otp;
    this.emailVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    return otp;
};

// Generate phone verification OTP
userSchema.methods.generatePhoneVerificationOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.phoneVerificationOTP = otp;
    this.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

// Generate password reset token (6-digit OTP)
userSchema.methods.generatePasswordResetToken = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.resetPasswordToken = otp;
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    return otp;
};

// Check if email verification token is valid
userSchema.methods.isEmailVerificationTokenValid = function () {
    return this.emailVerificationToken && this.emailVerificationExpires > Date.now();
};

// Check if phone verification OTP is valid
userSchema.methods.isPhoneVerificationOTPValid = function () {
    return this.phoneVerificationOTP && this.phoneVerificationExpires > Date.now();
};

// Check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function () {
    return this.resetPasswordToken && this.resetPasswordExpires > Date.now();
};

module.exports = mongoose.model('User', userSchema);
