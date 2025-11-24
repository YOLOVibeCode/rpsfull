/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rpsfull-platform/contracts'],
  env: {
    // Use real backend API by default (not mock API)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4444',
    // Set to 'true' to use mock API instead
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API || 'false',
  },
};

module.exports = nextConfig;

