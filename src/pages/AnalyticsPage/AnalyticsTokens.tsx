import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { TopMovers, TokensTable } from 'components';
import {
  useBookmarkTokens,
  useEthPrice,
  useMaticPrice,
  useIsV2,
} from 'state/application/hooks';
import { getTopTokens } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import { getTopTokensV3 } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';

const AnalyticsTokens: React.FC = () => {
  const { t } = useTranslation();
  const [tokensFilter, setTokensFilter] = useState(0);

  const dispatch = useDispatch();

  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { bookmarkTokens } = useBookmarkTokens();
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  const { isV2 } = useIsV2();

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
    if (isV2 === undefined) return;

    (async () => {
      if (!isV2) {
        if (
          maticPrice.price !== undefined &&
          maticPrice.oneDayPrice !== undefined
        ) {
          const data = await getTopTokensV3(
            maticPrice.price,
            maticPrice.oneDayPrice,
            GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      } else {
        if (
          ethPrice.price !== undefined &&
          ethPrice.oneDayPrice !== undefined
        ) {
          const data = await getTopTokens(
            ethPrice.price,
            ethPrice.oneDayPrice,
            GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
          );
          if (data) {
            updateTopTokens(data);
          }
        }
      }
    })();
  }, [
    ethPrice.price,
    ethPrice.oneDayPrice,
    maticPrice.price,
    maticPrice.oneDayPrice,
    isV2,
  ]);

  useEffect(() => {
    if (topTokens) {
      dispatch(setAnalyticsLoaded(true));
    }
  }, [topTokens, dispatch]);

  useEffect(() => {
    if (isV2) {
      updateTopTokens(null);
    }
  }, [isV2]);

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
