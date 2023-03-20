/**
 * @type {import('next').NextConfig}
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;
