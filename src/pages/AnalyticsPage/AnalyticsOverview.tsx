import React from 'react';
import { Box, Grid } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import AnalyticsInfo from './AnalyticsInfo';
import AnalyticsLiquidityChart from './AnalyticsLiquidityChart';
import AnalyticsVolumeChart from './AnalyticsVolumeChart';
import { useActiveWeb3React, useAnalyticsVersion } from 'hooks';
import AnalyticsExtraInfo from './AnalyticsExtraInfo';
import { ChainId } from '@uniswap/sdk';
import { useAnalyticsGlobalData } from 'hooks/useFetchAnalyticsData';
import { LiquidityHubAnalytics } from 'components';
import AnalyticsTopPairs from './AnalyticsTopPairs';
import AnalyticsTopTokens from './AnalyticsTopTokens';

dayjs.extend(utc);

const AnalyticsOverview: React.FC = () => {
  const { chainId } = useActiveWeb3React();
  const version = useAnalyticsVersion();

  const {
    isLoading: globalDataLoading,
    data: globalData,
  } = useAnalyticsGlobalData(version, chainId);

  const isLiquidityHub = version === 'liquidityhub';

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
        <Box className='flex flex-wrap panel'>
          {globalDataLoading ? (
            <Skeleton width='100%' height={20} />
          ) : globalData ? (
            <AnalyticsInfo data={globalData} />
          ) : (
            <></>
          )}
        </Box>
      </Box>
      <Box my={4}>
        <AnalyticsTopTokens />
      </Box>
      <AnalyticsTopPairs />
    </Box>
  );
};

export default AnalyticsOverview;
