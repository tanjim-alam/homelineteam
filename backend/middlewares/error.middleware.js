// 404 middleware
function notFoundHandler(req, res, next) {
	res.status(404).json({ message: 'Not Found' });
}

// Global error handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Internal Server Error';
	const details = err.details || undefined;
	res.status(statusCode).json({ message, details });
}

module.exports = { notFoundHandler, errorHandler };


