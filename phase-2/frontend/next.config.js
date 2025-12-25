/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // API proxy configuration for development
  // Better Auth handles /api/auth/* routes directly (no rewrite)
  // Only proxy task API routes to backend
  async rewrites() {
    return [
      {
        source: '/api/:userId/tasks/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:userId/tasks/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
