const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

exports.listTeam = async (req, res, next) => {
	try {
		const team = await Admin.find().select('-passwordHash').sort({ createdAt: -1 });
		res.json({ success: true, data: team });
	} catch (err) {
		next(err);
	}
};

exports.createTeamMember = async (req, res, next) => {
	try {
		const { name, email, password, role, permissions } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email and password are required' });
		}
		if (password.length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters' });
		}
		const existing = await Admin.findOne({ email: email.toLowerCase() });
		if (existing) return res.status(409).json({ message: 'Email already exists' });

		const passwordHash = await bcrypt.hash(password, 10);
		const finalRole = ['admin', 'manager', 'staff'].includes(role) ? role : 'staff';
		const member = await Admin.create({
			name,
			email: email.toLowerCase(),
			passwordHash,
			role: finalRole,
			permissions: finalRole === 'admin' ? [] : (Array.isArray(permissions) ? permissions : []),
			createdBy: req.user.id,
		});

		const { passwordHash: _omit, ...rest } = member.toObject();
		res.status(201).json({ success: true, data: rest });
	} catch (err) {
		next(err);
	}
};

exports.updateTeamMember = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { name, role, permissions, isActive, password } = req.body;

		const member = await Admin.findById(id);
		if (!member) return res.status(404).json({ message: 'Team member not found' });

		if (name !== undefined) member.name = name;
		if (role !== undefined && ['admin', 'manager', 'staff'].includes(role)) member.role = role;
		if (permissions !== undefined) member.permissions = member.role === 'admin' ? [] : permissions;
		if (isActive !== undefined) {
			if (String(member._id) === String(req.user.id) && !isActive) {
				return res.status(400).json({ message: 'You cannot deactivate your own account' });
			}
			member.isActive = isActive;
		}
		if (password) {
			if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
			member.passwordHash = await bcrypt.hash(password, 10);
		}

		await member.save();
		const { passwordHash: _omit, ...rest } = member.toObject();
		res.json({ success: true, data: rest });
	} catch (err) {
		next(err);
	}
};

exports.deleteTeamMember = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (String(id) === String(req.user.id)) {
			return res.status(400).json({ message: 'You cannot delete your own account' });
		}
		const member = await Admin.findByIdAndDelete(id);
		if (!member) return res.status(404).json({ message: 'Team member not found' });
		res.json({ success: true, message: 'Team member removed' });
	} catch (err) {
		next(err);
	}
};
