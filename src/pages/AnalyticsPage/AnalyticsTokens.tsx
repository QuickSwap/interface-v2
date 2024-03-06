import React, { useState, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { TopMovers, TokensTable } from '~/components';
import { useBookmarkTokens } from '~/state/application/hooks';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from '~/hooks';
import { useAnalyticsTopTokens } from '~/hooks/useFetchAnalyticsData';

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

  return (
    <Box width='100%' mb={3}>
      <TopMovers hideArrow={true} />
      <Box my={4} px={2} className='flex flex-wrap items-center'>
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
