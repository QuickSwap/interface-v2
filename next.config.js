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
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com', pathname: '**' },
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '**' },
      { protocol: 'https', hostname: 'pbs.twimg.com', pathname: '**' },
      { protocol: 'https', hostname: 's2.coinmarketcap.com', pathname: '**' },
      { protocol: 'https', hostname: 'data.everrise.com', pathname: '**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '**' },
      { protocol: 'https', hostname: 'augury.finance', pathname: '**' },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '1453456140-files.gitbook.io',
        pathname: '**',
      },
      { protocol: 'https', hostname: 'www.borderless.money', pathname: '**' },
      { protocol: 'https', hostname: 'polygonscan.com', pathname: '**' },
      { protocol: 'https', hostname: 'apeswap.mypinata.cloud', pathname: '**' },
      { protocol: 'https', hostname: 'usdv.money', pathname: '**' },
      { protocol: 'https', hostname: 'www.anyinu.xyz', pathname: '**' },
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
