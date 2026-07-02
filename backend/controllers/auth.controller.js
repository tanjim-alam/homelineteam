const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

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
		const admin = await Admin.findOne({ email });
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
	const admin = await Admin.findById(req.user.id);
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


