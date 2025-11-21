/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        // Use PROXY_API_URL first, then BACKEND_URL, otherwise fallback to localhost:3003
        destination: (() => {
          const raw = process.env.PROXY_API_URL || process.env.BACKEND_URL || 'http://localhost:3003/api';
          return `${String(raw).replace(/\/$/, '')}/:path*`;
        })(),
      },
    ];
  },
};

module.exports = nextConfig;

