const cloudinary = require('d:/mern/homelineteam/backend/node_modules/cloudinary').v2;

cloudinary.config({
  cloud_name: 'dmz316wxm',
  api_key: '247179179471582',
  api_secret: 'VSv5o_M_axaKxwz-ktxT-inuoJo',
});

const REVIEW_IDS = [
  '1om-5arlYbl71uVoP3uxLBlG9G-Yl3ibu',
  '1raUthBQQUsKAfUkgE8ZxoUoUm9EBidYB',
  '1KIOgWzV0ZCHUfun8FmBcCKjkIl-wxIFZ',
  '1QhkZA6ywIEpWXCK-J7TjkkZifG6s6oMe',
  '1SIoXHQtzejcRbSeN1VrOO0WZOjWU7HCT',
  '19O6mL8Kl1NI31WuWiZE4IMSLN_MFLyy3',
  '1aRSFmFKSm4-Bx_5PvttwMAeA-qCDIVkk',
  '13iBc8OYwHt4D2a3isp_xDZaOGvq2z-mP',
  '1Xtw2-sEANLWOLXJmR2LrLWQSZNdyaaKT',
];

async function run() {
  const results = [];
  for (const id of REVIEW_IDS) {
    const driveUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    process.stderr.write(`Uploading ${id}...\n`);
    try {
      const res = await cloudinary.uploader.upload(driveUrl, {
        resource_type: 'video',
        folder: 'reviews/flooring',
        public_id: id,
      });
      results.push({ id, secure_url: res.secure_url, bytes: res.bytes });
      process.stderr.write(`  OK -> ${res.secure_url}\n`);
    } catch (err) {
      results.push({ id, error: err.message });
      process.stderr.write(`  FAILED -> ${err.message}\n`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
