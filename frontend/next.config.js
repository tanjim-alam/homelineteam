/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.vijayhomeservices.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // optimizePackageImports: ['lucide-react'],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Skip static generation for 404 page
  trailingSlash: false,
}

module.exports = nextConfig
