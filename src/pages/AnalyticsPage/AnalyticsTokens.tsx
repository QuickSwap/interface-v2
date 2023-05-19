import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { TopMovers, TokensTable } from 'components';
import {
  useBookmarkTokens,
  useEthPrice,
  useMaticPrice,
} from 'state/application/hooks';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';

const AnalyticsTokens: React.FC = () => {
  const { t } = useTranslation();
  const [tokensFilter, setTokensFilter] = useState(0);

  const dispatch = useDispatch();

  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { bookmarkTokens } = useBookmarkTokens();
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const favoriteTokens = useMemo(() => {
    if (topTokens) {
      return topTokens.filter(
        (token: any) => bookmarkTokens.indexOf(token.id) > -1,
      );
    } else {
      return [];
    }
  }, [topTokens, bookmarkTokens]);

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-tokens/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to get top tokens`,
        );
      }
      const data = await res.json();
      if (data.data) {
        updateTopTokens(data.data);
      }
    })();
  }, [
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    version,
    chainId,
  ]);

  useEffect(() => {
    if (topTokens) {
      dispatch(setAnalyticsLoaded(true));
    } else {
      dispatch(setAnalyticsLoaded(false));
    }
  }, [topTokens, dispatch]);

  useEffect(() => {
    updateTopTokens(null);
  }, [version]);

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
        {topTokens ? (
          <TokensTable data={tokensFilter === 0 ? topTokens : favoriteTokens} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsTokens;
