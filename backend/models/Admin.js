const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PERMISSION_MODULES = [
	'dashboard', 'categories', 'products', 'interior-design', 'delivery-partners',
	'orders', 'users', 'leads', 'bookings', 'returns', 'settings',
];

const adminSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		name: { type: String, required: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
		// Ignored when role === 'admin' (admin always has full access)
		permissions: { type: [String], enum: PERMISSION_MODULES, default: [] },
		isActive: { type: Boolean, default: true },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
	},
	{ timestamps: true }
);

adminSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('Admin', adminSchema);
module.exports.PERMISSION_MODULES = PERMISSION_MODULES;


