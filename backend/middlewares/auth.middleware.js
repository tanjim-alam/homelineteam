const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
	try {
		const bearer = req.headers.authorization;
		const tokenFromCookie = req.cookies?.token;
		let token;
		if (bearer && bearer.startsWith('Bearer ')) token = bearer.split(' ')[1];
		else if (tokenFromCookie) token = tokenFromCookie;
		if (!token) return res.status(401).json({ message: 'Unauthorized' });
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.user = { _id: decoded.sub, id: decoded.sub, role: decoded.role, email: decoded.email, name: decoded.name };
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function requireAdmin(req, res, next) {
	if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
	return next();
}

module.exports = { authenticate, requireAdmin };


