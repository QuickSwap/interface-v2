// eslint-disable-next-line @typescript-eslint/no-var-requires
const { i18n } = require('./next-i18next.config');

/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@0xsquid/widget',
    '@orbs-network/twap-ui',
    '@orbs-network/twap-ui-quickswap',
    '@masa-finance/analytics-react',
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
  webpack(config) {
    config.resolve = {
      ...config.resolve,
      fallback: {
        fs: false,
        module: false,
        https: false,
        http: false,
        crypto: false,
        stream: false,
        zlib: false,
        os: false,
      },
    };

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;
