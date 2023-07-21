import fs from 'fs';
import axios from 'axios';
import { ChainId } from '@uniswap/sdk';

const PUBLIC_URL = 'https://quickswap.exchange/#';
const REACT_APP_LEADERBOARD_APP_URL = 'https://leaderboard.quickswap.exchange';

const pools_paths = ['/pools/', '/pools/v2', '/pools/v3'];
const farm_paths = [
  '/farm/',
  '/farm/v2',
  'farm/v2?tab=lpFarm',
  'farm/v2?tab=DualFarm',
  'farm/v2?tab=OtherFarm',
  '/farm/v3',
  '/farm/v3?tab=my-farms',
  '/farm/v3?tab=eternal-farms',
  '/farm/v3?tab=gamma-farms',
];

const analytics_paths = [
  '/analytics',
  '/analytics/v2',
  '/analytics/v2/pairs',
  '/analytics/v2/tokens',
  '/analytics/v3',
  '/analytics/v3/pairs',
  '/analytics/v3/tokens',
  '/analytics/total',
  '/analytics/total/pairs',
  '/analytics/total/tokens',
];

const static_paths = [
  '/',
  '/swap/',
  '/swap?isProMode=true',
  '/leader-board',
  '/migrate',
  '/dragons',
  '/convert',
  '/gamehub',
];

const fetchTopPairs = async (version: string, chainId: number) => {
  try {
    const URL = `${REACT_APP_LEADERBOARD_APP_URL}/analytics/top-pairs/${version}?chainId=${chainId}`;
    console.log('URL = ', URL);
    const response = await axios.get(URL);
    const pairsData = response.data;
    // console.log('pairsData => ', pairsData);

    const tokenIds = pairsData?.data?.map((pair: any) => pair.id);
    const paths = tokenIds.map(
      (tokenId: string) => `/analytics/${version}/pair/${tokenId}`,
    );
    return paths;
  } catch (err) {
    const error = err as any;
    console.error(
      `Failed to get top pairs ${version}:`,
      error.response?.data || error.message || error,
    );
    return [];
  }
};

const fetchTopTokens = async (version: string, chainId: number) => {
  try {
    const URL = `${REACT_APP_LEADERBOARD_APP_URL}/analytics/top-tokens/${version}?chainId=${chainId}`;
    console.log('URL = ', URL);
    const response = await axios.get(URL);
    const tokensData = response.data;

    const tokenIds = tokensData?.data?.map((token: any) => token.id);
    const paths = tokenIds.map(
      (tokenId: string) => `/analytics/${version}/token/${tokenId}`,
    );
    return paths;
  } catch (err) {
    const error = err as any;
    console.error(
      `Failed to get top tokens ${version}:`,
      error.response?.data || error.message || error,
    );
    return [];
  }
};

const additional_analytics_paths: string[] = [];

const generateDynamicPaths = async () => {
  // for (const chainId of chain_ids) {
  const chainId = ChainId.MATIC;
  for (const version of ['v2', 'v3', 'total']) {
    const paths = await fetchTopPairs(version, chainId);
    additional_analytics_paths.push(...paths);

    const tokenPaths = await fetchTopTokens(version, chainId);
    additional_analytics_paths.push(...tokenPaths);
  }
  // }
};

generateDynamicPaths()
  .then(() => {
    console.log('Fetch completed');
    generateSitemap();
  })
  .catch((err) => console.log(err));

function generateSitemap() {
  const paths = [
    ...static_paths,
    ...pools_paths,
    ...farm_paths,
    ...analytics_paths,
    ...additional_analytics_paths,
    // ...dynamic_paths,
  ];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  paths.forEach((path) => {
    const url = `${PUBLIC_URL}${path}`;

    sitemap += '  <url>\n';
    sitemap += `    <loc>${url}</loc>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  const buildPath = './public/sitemap.xml';
  fs.writeFileSync(buildPath, sitemap);

  console.info(`> ✔️ Sitemap successfully generated at ${buildPath}`);
}
