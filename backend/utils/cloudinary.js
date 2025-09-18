const cloudinary = require('cloudinary').v2;

function configureCloudinary() {

	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dmz316wxm",
		api_key: process.env.CLOUDINARY_API_KEY || "247179179471582",
		api_secret: process.env.CLOUDINARY_API_SECRET || "VSv5o_M_axaKxwz-ktxT-inuoJo",
	});

	// Cloudinary configured successfully
}

async function uploadBuffer(buffer, folder) {
	return new Promise((resolve, reject) => {
		const stream = cloudinary.uploader.upload_stream(
			{ folder, resource_type: 'image' },
			(error, result) => {
				if (error) {
					return reject(error);
				}
				return resolve(result);
			}
		);
		stream.end(buffer);
	});
}

module.exports = { configureCloudinary, uploadBuffer };


