import React, { useState, useEffect, useMemo } from 'react';
import { Box } from '@material-ui/core';
import { TopMovers, TokensTable } from 'components';
import {
  useBookmarkTokens,
  useEthPrice,
  useMaticPrice,
} from 'state/application/hooks';
import { getTopTokens } from 'utils';
import { Skeleton } from '@material-ui/lab';
import { useTranslation } from 'react-i18next';
import { GlobalConst } from 'constants/index';
import { getTopTokensTotal, getTopTokensV3 } from 'utils/v3-graph';
import { useDispatch } from 'react-redux';
import { setAnalyticsLoaded } from 'state/analytics/actions';
import { useParams } from 'react-router-dom';

const AnalyticsTokens: React.FC = () => {
  const { t } = useTranslation();
  const [tokensFilter, setTokensFilter] = useState(0);

  const dispatch = useDispatch();

  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const { bookmarkTokens } = useBookmarkTokens();
  const { ethPrice } = useEthPrice();
  const { maticPrice } = useMaticPrice();

  const params: any = useParams();
  const version = params && params.version ? params.version : 'total';

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
    (async () => {
      if (version === 'v3') {
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
      } else if (version === 'v2') {
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
      } else {
        if (
          maticPrice.price &&
          maticPrice.oneDayPrice &&
          ethPrice.price &&
          ethPrice.oneDayPrice
        ) {
          const data = await getTopTokensTotal(
            ethPrice.price,
            ethPrice.oneDayPrice,
            maticPrice.price,
            maticPrice.oneDayPrice,
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
    version,
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
