export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/profile',
          '/my-orders',
          '/my-returns',
          '/cart',
          '/checkout',
          '/return-request',
          '/_next/',
        ],
      },
    ],
    sitemap: 'https://homelineteam.com/sitemap.xml',
    host: 'https://homelineteam.com',
  };
}
