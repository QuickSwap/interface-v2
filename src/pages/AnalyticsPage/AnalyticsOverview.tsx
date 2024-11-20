import React, { useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Skeleton from '@material-ui/lab/Skeleton';
import { ArrowForwardIos } from '@material-ui/icons';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { TokensTable, PairTable, Eggs } from 'components';
import AnalyticsInfo from './AnalyticsInfo';
import AnalyticsLiquidityChart from './AnalyticsLiquidityChart';
import AnalyticsVolumeChart from './AnalyticsVolumeChart';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import AnalyticsExtraInfo from './AnalyticsExtraInfo';
import { ChainId } from '@uniswap/sdk';
import {
  useAnalyticsGlobalData,
  useAnalyticsTopPairs,
  useAnalyticsTopTokens,
} from 'hooks/useFetchAnalyticsData';
import { LiquidityHubAnalytics } from 'components';
import { DRAGON_EGGS_SHOW } from 'constants/index';

dayjs.extend(utc);

const AnalyticsOverview: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const history = useHistory();
  const version = useAnalyticsVersion();

  const {
    isLoading: globalDataLoading,
    data: globalData,
  } = useAnalyticsGlobalData(version, chainId);

  const {
    isLoading: topTokensLoading,
    data: topTokens,
  } = useAnalyticsTopTokens(version, chainId);

  const { isLoading: topPairsLoading, data: topPairs } = useAnalyticsTopPairs(
    version,
    chainId,
  );

  const isLiquidityHub = version === 'liquidityhub';

  const [dragonEggHatched, setDragonEggHatched] = useState(false);

  const changeDragonEggAnimation = () => {
    setDragonEggHatched(!dragonEggHatched);
  };

  return isLiquidityHub ? (
    <Box width='100%' mb={3}>
      <LiquidityHubAnalytics />
    </Box>
  ) : (
    <Box width='100%' mb={3}>
      {(chainId === ChainId.DOGECHAIN || chainId === ChainId.MATIC) && (
        <AnalyticsExtraInfo data={globalData} chainId={chainId} />
      )}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='panel' width={1}>
            <AnalyticsLiquidityChart globalData={globalData} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Box className='analyticsVolumeChart panel'>
            <AnalyticsVolumeChart globalData={globalData} />
          </Box>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Box
          className={`flex flex-wrap panel`}
          sx={{ minHeight: '180px', position: 'relative' }}
        >
          {globalDataLoading ? (
            <Skeleton width='80%' height={20} />
          ) : globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <></>
          )}
        </Box>
      </Box>
      <Box mt={4}>
        <Box className='flex items-center justify-between'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topTokens')}</p>
          </Box>
          <Box
            className='cursor-pointer headingWrapper'
            onClick={() => history.push(`/analytics/${version}/tokens`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topTokensLoading ? (
          <Skeleton variant='rect' width='100%' height={150} />
        ) : topTokens ? (
          <TokensTable
            data={topTokens
              .sort((token1: any, token2: any) => {
                return token1.totalLiquidityUSD > token2.totalLiquidityUSD
                  ? -1
                  : 1;
              })
              .slice(0, 10)}
            showPagination={false}
          />
        ) : (
          <></>
        )}
      </Box>
      <Box mt={4}>
        <Box className='flex items-center justify-between'>
          <Box className='headingWrapper'>
            <p className='weight-600'>{t('topPairs')}</p>
          </Box>
          <Box
            className='cursor-pointer headingWrapper'
            onClick={() => history.push(`/analytics/${version}/pairs`)}
          >
            <p className='weight-600'>{t('seeAll')}</p>
            <ArrowForwardIos />
          </Box>
        </Box>
      </Box>
      <Box mt={3} className='panel'>
        {topPairsLoading ? (
          <Skeleton variant='rect' width='100%' height={150} />
        ) : topPairs ? (
          <PairTable
            data={topPairs
              .sort((pair1: any, pair2: any) => {
                const liquidity1 = pair1.trackedReserveUSD
                  ? pair1.trackedReserveUSD
                  : pair1.reserveUSD ?? 0;
                const liquidity2 = pair2.trackedReserveUSD
                  ? pair2.trackedReserveUSD
                  : pair2.reserveUSD ?? 0;
                return liquidity1 > liquidity2 ? -1 : 1;
              })
              .slice(0, 10)}
            showPagination={false}
          />
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

export default AnalyticsOverview;
