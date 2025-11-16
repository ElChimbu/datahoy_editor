/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: process.env.PROXY_API_URL || 'http://localhost:3003/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

