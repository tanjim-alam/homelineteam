const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		name: { type: String, required: true },
		passwordHash: { type: String, required: true },
		role: { type: String, default: 'admin' },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

adminSchema.methods.comparePassword = async function (password) {
	return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('Admin', adminSchema);


