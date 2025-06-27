/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  distDir: 'pricing-dashboard/.next',
  transpilePackages: ['pricing-dashboard'],
  webpack: (config, { isServer }) => {
    // Add our custom path resolving for @/ aliases
    config.resolve.alias['@'] = path.join(__dirname, 'pricing-dashboard');
    return config;
  },
};

module.exports = nextConfig;
