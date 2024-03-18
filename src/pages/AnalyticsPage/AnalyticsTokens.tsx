import React, { useState, useMemo, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { TopMovers, TokensTable } from 'components';
import { useBookmarkTokens } from 'state/application/hooks';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import { useAnalyticsTopTokens } from 'hooks/useFetchAnalyticsData';
import { getConfig } from 'config/index';
import { formatNumber, getFormattedPrice } from 'utils';
import { exportToXLSX } from 'utils/exportToXLSX';
import Loader from 'components/Loader';

const AnalyticsTokens: React.FC = () => {
  const { t } = useTranslation();
  const [tokensFilter, setTokensFilter] = useState(0);

  const { bookmarkTokens } = useBookmarkTokens();
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const {
    isLoading: topTokensLoading,
    data: topTokens,
  } = useAnalyticsTopTokens(version, chainId);

  const favoriteTokens = useMemo(() => {
    if (topTokens) {
      return topTokens.filter(
        (token: any) => bookmarkTokens.indexOf(token.id) > -1,
      );
    } else {
      return [];
    }
  }, [topTokens, bookmarkTokens]);

  const [xlsExported, setXLSExported] = useState(false);
  const config = getConfig(chainId);
  const networkName = config['networkName'];

  useEffect(() => {
    if (xlsExported) {
      const exportData = topTokens
        .sort((token1: any, token2: any) => {
          return token1.totalLiquidityUSD > token2.totalLiquidityUSD ? -1 : 1;
        })
        .map((token: any) => {
          return {
            Name: token.name + ' (' + token.symbol + ')',
            Price: `$${formatNumber(token.priceUSD)}`,
            '24H %': `${getFormattedPrice(Number(token.priceChangeUSD))}%`,
            '24H Volume': `$${formatNumber(token.oneDayVolumeUSD)}`,
            Liquidity: `$${formatNumber(token.totalLiquidityUSD)}`,
          };
        });
      exportToXLSX(exportData, `Quickswap-Tokens-${networkName}-${version}`);
      setTimeout(() => {
        setXLSExported(false);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xlsExported]);

  return (
    <Box width='100%' mb={3}>
      <TopMovers hideArrow={true} />
      <Box
        my={4}
        px={2}
        className='flex flex-wrap items-center justify-between'
        gridGap={8}
      >
        <Box className='flex items-center flex-wrap' gridGap={12}>
          <Box
            className={`tokensFilter ${
              tokensFilter === 0 ? 'text-primary' : 'text-disabled'
            }`}
            onClick={() => setTokensFilter(0)}
          >
            <p className='weight-600'>{t('allCryptos')}</p>
          </Box>
          <Box
            className={`tokensFilter ${
              tokensFilter === 1 ? 'text-primary' : 'text-disabled'
            }`}
            onClick={() => setTokensFilter(1)}
          >
            <p className='weight-600'>{t('favourites')}</p>
          </Box>
          <Box
            className={`tokensFilter ${
              tokensFilter === 2 ? 'text-primary' : 'text-disabled'
            }`}
            onClick={() => setTokensFilter(2)}
          >
            <p className='weight-600'>{t('newListing')}</p>
          </Box>
        </Box>
        <Box
          className={`bg-secondary1 flex items-center ${
            xlsExported ? '' : 'cursor-pointer'
          }`}
          padding='4px 8px'
          borderRadius={6}
          onClick={() => {
            if (!xlsExported) setXLSExported(true);
          }}
        >
          {xlsExported ? <Loader /> : <small>{t('export')}</small>}
        </Box>
      </Box>
      <Box className='panel'>
        {topTokensLoading ? (
          <Skeleton variant='rect' width='100%' height={150} />
        ) : topTokens ? (
          <TokensTable data={tokensFilter === 0 ? topTokens : favoriteTokens} />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsTokens;
