import React, { useState, useEffect } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useEthPrice, useGlobalData } from 'state/application/hooks';
import {
  getTopPairs,
  getTopTokens,
  getGlobalData,
  getBulkPairData,
} from 'utils';
import { GlobalConst } from 'constants/index';
import { TokensTable, PairTable } from 'components';
import AnalyticsInfo from './AnalyticsInfo';
import AnalyticsLiquidityChart from './AnalyticsLiquidityChart';
import AnalyticsVolumeChart from './AnalyticsVolumeChart';
import { useTranslation } from 'react-i18next';
import { getGlobalDataV3, getTopPairsV3, getTopTokensV3 } from 'utils/v3-graph';
import { useIsV3 } from 'state/analytics/hooks';

dayjs.extend(utc);

const AnalyticsOverview: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { globalData, updateGlobalData } = useGlobalData();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const [topPairs, updateTopPairs] = useState<any[] | null>(null);
  const { ethPrice } = useEthPrice();

  const isV3 = useIsV3();

  useEffect(() => {
    if (!ethPrice.price || !ethPrice.oneDayPrice) return;

    const globalDataFn = isV3
      ? getGlobalDataV3()
      : getGlobalData(ethPrice.price, ethPrice.oneDayPrice);

    globalDataFn.then((data) => {
      if (data) {
        updateGlobalData({ data });
      }
    });

    const topTokensFn = isV3
      ? getTopTokensV3(
          ethPrice.price,
          ethPrice.oneDayPrice,
          GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
        )
      : getTopTokens(
          ethPrice.price,
          ethPrice.oneDayPrice,
          GlobalConst.utils.ANALYTICS_TOKENS_COUNT,
        );

    topTokensFn.then((data) => {
      if (data) {
        updateTopTokens(data);
      }
    });

    const topPairsFn = isV3
      ? getTopPairsV3(GlobalConst.utils.ANALYTICS_PAIRS_COUNT)
      : getBulkPairData(
          GlobalConst.utils.ANALYTICS_PAIRS_COUNT,
          ethPrice.price,
        );

    topPairsFn.then((data) => {
      if (data) {
        updateTopPairs(data);
      }
    });
  }, [updateGlobalData, ethPrice.price, ethPrice.oneDayPrice, isV3]);

  return (
    <Box width='100%' mb={3}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='panel' width={1}>
            {/* <AnalyticsLiquidityChart /> */}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='analyticsVolumeChart panel'>
            {/* <AnalyticsVolumeChart /> */}
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box className='panel flex flex-wrap'>
          {globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <Skeleton width='100%' height={20} />
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <Box className='flex justify-between items-center'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topTokens')}</p>
          </Box>
          <Box
            className='headingWrapper cursor-pointer'
            onClick={() => history.push(`/analytics/tokens`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topTokens ? (
          <TokensTable data={topTokens} showPagination={false} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
      <Box mt={4}>
        <Box className='flex items-center justify-between'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topPairs')}</p>
          </Box>
          <Box
            className='headingWrapper cursor-pointer'
            onClick={() => history.push(`/analytics/pairs`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topPairs ? (
          <PairTable data={topPairs} showPagination={false} />
        ) : (
          <Skeleton variant='rect' width='100%' height={150} />
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsOverview;
