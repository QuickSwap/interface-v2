// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require('./next-i18next.config');

/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@0xsquid/widget',
    '@orbs-network/twap-ui',
    '@orbs-network/twap-ui-quickswap',
  ],
  i18n,
  images: {
    domains: [
      'assets.coingecko.com',
      'i.imgur.com',
      'pbs.twimg.com',
      's2.coinmarketcap.com',
      'data.everrise.com',
      'res.cloudinary.com',
      'augury.finance',
      'encrypted-tbn0.gstatic.com',
    ],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          module: false,
        },
      };
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;
