const path = require('path');
const fs = require('fs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rpsfull-platform/contracts'],
  typescript: {
    // Skip type checking during build - types are checked in CI/local dev
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    const rootPath = path.resolve(__dirname, '../../');
    const contractsPath = path.resolve(rootPath, 'packages/contracts');
    const contractsDist = path.resolve(contractsPath, 'dist');
    const contractsIndex = path.resolve(contractsDist, 'index.js');
    
    // Point alias directly to dist/index.js if it exists
    // Otherwise fall back to package directory
    const aliasTarget = fs.existsSync(contractsIndex) 
      ? contractsIndex.replace(/\.js$/, '') // Remove .js extension for proper resolution
      : contractsPath;
    
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.alias) config.resolve.alias = {};
    
    config.resolve.alias['@rpsfull-platform/contracts'] = aliasTarget;
    config.resolve.symlinks = true;
    config.resolve.mainFields = ['main', 'module', 'types'];
    
    console.log('Webpack alias set to:', config.resolve.alias['@rpsfull-platform/contracts']);
    console.log('Contracts dist exists:', fs.existsSync(contractsDist));
    console.log('Contracts index exists:', fs.existsSync(contractsIndex));
    
    return config;
  },
  env: {
    // Use real backend API by default (not mock API)
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4444',
    // Set to 'true' to use mock API instead
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API || 'false',
  },
};

module.exports = nextConfig;

