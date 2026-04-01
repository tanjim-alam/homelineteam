const mongoose = require('mongoose');

/**
 * Establish a connection to MongoDB using Mongoose
 */
async function connectDatabase() {
	const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://homeline:homeline123@cluster0.symdr6d.mongodb.net/homelineteam';
	try {
		mongoose.set('strictQuery', true);
		await mongoose.connect(mongoUri, {
			// Keep options minimal; Mongoose 8 handles defaults well
		});
		console.log('MongoDB connected successfully');
		// MongoDB connected successfully
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);

		process.exit(1);
	}
}

module.exports = connectDatabase;


