const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { createEmailTransporter } = require('../utils/emailService');

function signToken(admin) {
	const payload = {
		sub: admin._id,
		role: admin.role,
		email: admin.email,
		name: admin.name,
		permissions: admin.permissions || [],
	};
	return jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

// Admin-only: creating accounts now happens through Team Management (see team.routes.js),
// this stays as the underlying create logic.
exports.register = async (req, res, next) => {
	try {
		const { name, email, password, role, permissions } = req.body;
		const existing = await Admin.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already exists' });
		const passwordHash = await bcrypt.hash(password, 10);
		const admin = await Admin.create({
			name,
			email,
			passwordHash,
			role: role || 'staff',
			permissions: role === 'admin' ? [] : (permissions || []),
			createdBy: req.user?.id,
		});
		res.status(201).json({ id: admin._id, email: admin.email, name: admin.name, role: admin.role });
	} catch (err) {
		next(err);
	}
};

exports.login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const admin = await Admin.findOne({ email, deletedAt: null });
		if (!admin || !admin.isActive) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await admin.comparePassword(password);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken(admin);

		// Cookie configuration for development and production
		const isProduction = process.env.NODE_ENV === 'production';
		const origin = req.get('origin') || '';
		const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
		const isVercel = origin.includes('vercel.app') || origin.includes('homelineteams.com');

		// Set cookie with proper configuration
		const cookieOptions = {
			httpOnly: true,
			secure: isProduction, // Always secure in production
			sameSite: isVercel ? 'none' : 'lax', // 'none' for Vercel domains, 'lax' for others
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			path: '/',
			// Don't set domain to allow cross-subdomain cookies
		};


		res
			.cookie('token', token, cookieOptions)
			.json({
				message: 'Logged in',
				admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role, permissions: admin.permissions || [] },
				token: token // Also send token in response for fallback
			});
	} catch (err) {
		next(err);
	}
};

exports.logout = async (req, res) => {
	// Clear cookie with same options as login
	const isProduction = process.env.NODE_ENV === 'production';
	const origin = req.get('origin') || '';
	const isVercel = origin.includes('vercel.app') || origin.includes('homelineteams.com');

	const cookieOptions = {
		httpOnly: true,
		secure: isProduction,
		sameSite: isVercel ? 'none' : 'lax',
		path: '/',
	};

	res.clearCookie('token', cookieOptions).json({ message: 'Logged out' });
};

exports.me = async (req, res) => {
	if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
	// Re-fetch from DB so role/permission changes apply without waiting for the JWT to expire.
	const admin = await Admin.findOne({ _id: req.user.id, deletedAt: null });
	if (!admin || !admin.isActive) return res.status(401).json({ message: 'Unauthorized' });
	res.json({
		user: {
			id: admin._id,
			email: admin.email,
			name: admin.name,
			role: admin.role,
			permissions: admin.permissions || [],
		},
	});
};

// Request a password reset code — sent to the admin's email, valid for 1 hour.
// Always responds with the same message whether or not the email exists, so this
// endpoint can't be used to enumerate admin accounts.
exports.forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email is required' });

		const genericMessage = 'If that email belongs to an admin account, a reset code has been sent.';
		const admin = await Admin.findOne({ email: email.toLowerCase(), deletedAt: null, isActive: true });
		if (!admin) return res.json({ success: true, message: genericMessage });

		const otp = admin.generatePasswordResetToken();
		await admin.save();

		try {
			const transporter = createEmailTransporter();
			await transporter.sendMail({
				from: process.env.EMAIL_USER || 'homeline042@gmail.com',
				to: admin.email,
				subject: 'Password Reset Code - HomelineTeam Admin Panel',
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
						<h2 style="color: #333;">Password Reset Request</h2>
						<p>Hello ${admin.name},</p>
						<p>Use the following code to reset your admin panel password:</p>
						<div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
							<h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
						</div>
						<p>This code is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
						<p>Best regards,<br>HomelineTeam</p>
					</div>
				`,
			});
		} catch (emailErr) {
			// Don't leak whether the send failed — but don't leave a dangling reset token either.
			admin.resetPasswordToken = null;
			admin.resetPasswordExpires = null;
			await admin.save();
			return next(emailErr);
		}

		res.json({ success: true, message: genericMessage });
	} catch (err) {
		next(err);
	}
};

// Complete a password reset using the emailed code.
exports.resetPassword = async (req, res, next) => {
	try {
		const { email, code, newPassword } = req.body;
		if (!email || !code || !newPassword) {
			return res.status(400).json({ message: 'Email, code and new password are required' });
		}
		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters' });
		}

		const admin = await Admin.findOne({ email: email.toLowerCase(), deletedAt: null });
		if (!admin || !admin.isPasswordResetTokenValid() || admin.resetPasswordToken !== code) {
			return res.status(400).json({ message: 'Invalid or expired reset code' });
		}

		admin.passwordHash = await bcrypt.hash(newPassword, 10);
		admin.resetPasswordToken = null;
		admin.resetPasswordExpires = null;
		await admin.save();

		res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
	} catch (err) {
		next(err);
	}
};

// Self-service password change for a logged-in admin panel user (any role).
exports.changePassword = async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body;
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: 'Current and new password are required' });
		}
		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'New password must be at least 6 characters' });
		}

		const admin = await Admin.findOne({ _id: req.user.id, deletedAt: null });
		if (!admin) return res.status(401).json({ message: 'Unauthorized' });

		const ok = await admin.comparePassword(currentPassword);
		if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

		admin.passwordHash = await bcrypt.hash(newPassword, 10);
		await admin.save();

		res.json({ success: true, message: 'Password changed successfully' });
	} catch (err) {
		next(err);
	}
};


