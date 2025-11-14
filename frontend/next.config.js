/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    USE_MOCK_DATA: process.env.USE_MOCK_DATA || 'true',
  },
};

module.exports = nextConfig;
