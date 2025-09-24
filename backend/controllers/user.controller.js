const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Simple in-memory rate limiting
const registrationAttempts = new Map();
const REGISTRATION_COOLDOWN = 30000; // 30 seconds

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of registrationAttempts.entries()) {
        if (now - timestamp > REGISTRATION_COOLDOWN * 2) {
            registrationAttempts.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Create JWT token for user
function createUserToken(user) {
    const payload = {
        sub: user._id,
        role: 'user',
        email: user.email,
        name: user.name
    };
    return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

// Email transporter configuration
const createEmailTransporter = () => {
    const emailUser = process.env.EMAIL_USER || 'ahaanwell@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'qwbnsavibnsvdwma';


    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
    try {
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: 'noreply@homelineteams.com',
            to: email,
            subject: 'Email Verification OTP - HomeLine Teams',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hello!</p>
          <p>Thank you for registering with HomeLine Teams. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP is valid for 15 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p>Best regards,<br>HomeLine Teams</p>
        </div>
      `
        };


        const result = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};

// Register user with email OTP
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;


        // Rate limiting check
        const now = Date.now();
        const key = `${email}_${phone}`;
        const lastAttempt = registrationAttempts.get(key);

        if (lastAttempt && (now - lastAttempt) < REGISTRATION_COOLDOWN) {
            return res.status(429).json({
                success: false,
                message: 'Please wait before trying to register again'
            });
        }

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            if (existingUser.phone === phone) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already registered'
                });
            }
        }

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password
        });

        // Generate email verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();


        // Send OTP via email
        const emailSent = await sendOTPEmail(email, verificationToken);

        if (!emailSent) {
            // For development, we'll keep the user but log the OTP
            if (process.env.NODE_ENV === 'development') {

                res.status(201).json({
                    success: true,
                    message: 'Registration successful. Check console for OTP (development mode).',
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        isEmailVerified: user.isEmailVerified
                    },
                    developmentOTP: verificationToken // Only in development
                });
            } else {
                // In production, delete the user if email fails
                await User.findByIdAndDelete(user._id);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send verification email. Please try again.'
                });
            }
        }


        // Record successful registration attempt
        registrationAttempts.set(key, now);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification OTP.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        next(error);
    }
};

// Verify email with OTP
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP is valid
        if (!user.isEmailVerificationTokenValid() || user.emailVerificationToken !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Verify email
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        // Create token
        const token = createUserToken(user);

        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            }
        });

    } catch (error) {
        next(error);
    }
};

// Resend email OTP
exports.resendEmailOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, verificationToken);

        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Verification OTP sent to your email'
        });

    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {

            // Generate new verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save();

            // Send OTP via email
            const emailSent = await sendOTPEmail(user.email, verificationToken);

            if (!emailSent) {
                // For development, we'll still allow login with OTP in console
                if (process.env.NODE_ENV === 'development') {
                    return res.status(200).json({
                        success: false,
                        message: 'Email verification required. Check console for OTP (development mode).',
                        requiresVerification: true,
                        email: user.email,
                        developmentOTP: verificationToken
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to send verification email. Please try again.'
                    });
                }
            }

            return res.status(200).json({
                success: false,
                message: 'Email verification required. Please check your email for verification OTP.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Create token
        const token = createUserToken(user);

        // Cookie configuration
        const isProduction = process.env.NODE_ENV === 'production';
        const origin = req.get('origin') || '';
        const isVercel = origin.includes('vercel.app') || origin.includes('homelineteams.com');

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isVercel ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        };

        res.cookie('user_token', token, cookieOptions).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            }
        });

    } catch (error) {
        next(error);
    }
};

// Logout user
exports.logout = async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const origin = req.get('origin') || '';
    const isVercel = origin.includes('vercel.app') || origin.includes('homelineteams.com');

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isVercel ? 'none' : 'lax',
        path: '/',
    };

    res.clearCookie('user_token', cookieOptions).json({
        success: true,
        message: 'Logged out successfully'
    });
};

// Get user profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                addresses: user.addresses,
                preferences: user.preferences,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        next(error);
    }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, preferences } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // Check if phone is already taken by another user
        if (phone && phone !== user.phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Phone number already in use'
                });
            }
        }

        // Update user fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (preferences) user.preferences = { ...user.preferences, ...preferences };

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                addresses: user.addresses,
                preferences: user.preferences
            }
        });

    } catch (error) {
        next(error);
    }
};

// Add address
exports.addAddress = async (req, res, next) => {
    try {
        const { type, name, phone, address, city, state, pincode, landmark, isDefault } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        // If this is set as default, unset other default addresses
        if (isDefault) {
            user.addresses.forEach(addr => {
                addr.isDefault = false;
            });
        }

        const newAddress = {
            type,
            name,
            phone,
            address,
            city,
            state,
            pincode,
            landmark,
            isDefault: isDefault || false
        };

        user.addresses.push(newAddress);
        await user.save();

        res.json({
            success: true,
            message: 'Address added successfully',
            address: newAddress
        });

    } catch (error) {
        next(error);
    }
};

// Update address
exports.updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const { type, name, phone, address, city, state, pincode, landmark, isDefault } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If this is set as default, unset other default addresses
        if (isDefault) {
            user.addresses.forEach((addr, index) => {
                if (index !== addressIndex) {
                    addr.isDefault = false;
                }
            });
        }

        // Update address
        user.addresses[addressIndex] = {
            ...user.addresses[addressIndex].toObject(),
            type,
            name,
            phone,
            address,
            city,
            state,
            pincode,
            landmark,
            isDefault: isDefault || false
        };

        await user.save();

        res.json({
            success: true,
            message: 'Address updated successfully',
            address: user.addresses[addressIndex]
        });

    } catch (error) {
        next(error);
    }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
        if (addressIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        user.addresses.splice(addressIndex, 1);
        await user.save();

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate password reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send reset email
        const transporter = createEmailTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Password Reset - HomeLine Teams',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name}!</p>
          <p>You requested a password reset for your HomeLine Teams account.</p>
          <p>Please use the following 6-digit code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetToken}</h1>
          </div>
          <p>This code is valid for 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>HomeLine Teams</p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: 'Password reset token sent to your email'
        });

    } catch (error) {
        next(error);
    }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, token, and new password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if reset token is valid
        if (!user.isPasswordResetTokenValid() || user.resetPasswordToken !== token) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        next(error);
    }
};

// Admin endpoint to manually verify user (for development/testing)
exports.manualVerifyUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'User already verified'
            });
        }

        // Manually verify the user
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'User manually verified successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        next(error);
    }
};

// Admin routes for user management

// Get all users (admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        next(error);
    }
};

// Get user by ID (admin)
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id)
            .select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

// Update user (admin)
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        // Return user without sensitive data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            addresses: user.addresses,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json(userResponse);
    } catch (error) {
        next(error);
    }
};

// Delete user (admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'User deleted successfully',
            _id: id
        });
    } catch (error) {
        next(error);
    }
};

// Toggle user status (admin)
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        // Return user without sensitive data
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            addresses: user.addresses,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json(userResponse);
    } catch (error) {
        next(error);
    }
};
