import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { ReactComponent as HelpIcon } from 'assets/images/HelpIcon1.svg';
import SupplyLiquidity from './SupplyLiquidity';
import YourLiquidityPools from './YourLiquidityPools';
import { useTranslation } from 'react-i18next';
import 'pages/styles/pools.scss';
import useParsedQueryString from 'hooks/useParsedQueryString';
import PoolToggle from './PoolToggle';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';

const PoolsPage: React.FC = () => {
  const parsedQuery = useParsedQueryString();
  const poolVersion =
    parsedQuery && parsedQuery.version ? (parsedQuery.version as string) : 'v3';

  const { t } = useTranslation();

  const {
    fetchRewards: { rewardsResult, fetchRewardsFn, rewardsLoading },
    fetchAllEvents: { fetchAllEventsFn, allEvents, allEventsLoading },
    fetchTransferredPositions: {
      // fetchTransferredPositionsFn,
      transferredPositions,
      transferredPositionsLoading,
    },
    fetchHasTransferredPositions: {
      fetchHasTransferredPositionsFn,
      hasTransferredPositions,
      hasTransferredPositionsLoading,
    },
  } = useFarmingSubgraph() || {};

  return (
    <Box width='100%' mb={3}>
      <Box className='pageHeading'>
        <Box className='flex row items-center'>
          <h4>{t('pool')}</h4>
          <PoolToggle />
        </Box>

        <Box className='helpWrapper' style={{ alignSelf: 'flex-end' }}>
          <small>{t('help')}</small>
          <HelpIcon />
        </Box>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={5}>
          <Box className='wrapper'>
            <SupplyLiquidity isV3={poolVersion === 'v3'} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={7}>
          <Box className='wrapper'>
            <YourLiquidityPools />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PoolsPage;
