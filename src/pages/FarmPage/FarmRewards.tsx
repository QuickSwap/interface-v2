import React, { useMemo } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useUSDRewardsandFees } from 'state/stake/hooks';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { returnStakingInfo } from 'utils';

const FarmRewards: React.FC<{ farmIndex: number; bulkPairs: any }> = ({
  farmIndex,
  bulkPairs,
}) => {
  const { breakpoints } = useTheme();
  const { chainId } = useActiveWeb3React();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const farmData = useUSDRewardsandFees(
    farmIndex === GlobalConst.farmIndex.LPFARM_INDEX,
    bulkPairs,
  );
  const dQuickRewardSum = useMemo(() => {
    if (!chainId) return 0;
    const stakingData = returnStakingInfo()[chainId] ?? [];
    const rewardSum = stakingData.reduce((total, item) => total + item.rate, 0);
    return rewardSum;
  }, [chainId]);

  const getRewardsSection = (isLPFarm: boolean) => (
    <>
      <Box
        width={isMobile ? 1 : isLPFarm ? 1 / 3 : 1 / 2}
        p={1.5}
        className={`text-center ${isMobile ? '' : 'border-right'}`}
      >
        <Box mb={1}>
          <span className='text-secondary'>Total Rewards</span>
        </Box>
        {farmData.rewardsUSD ? (
          <h6 className='weight-600'>
            ${farmData.rewardsUSD.toLocaleString()} / Day
          </h6>
        ) : (
          <Skeleton width='100%' height='28px' />
        )}
      </Box>
      <Box
        width={isMobile ? 1 : isLPFarm ? 1 / 3 : 1 / 2}
        p={1.5}
        textAlign='center'
      >
        <Box mb={1}>
          <span className='text-secondary'>Fees [24h]</span>
        </Box>
        {farmData.stakingFees ? (
          <h6 className='weight-600'>
            ${farmData.stakingFees.toLocaleString()}
          </h6>
        ) : (
          <Skeleton width='100%' height='28px' />
        )}
      </Box>
    </>
  );

  return (
    <Box
      display='flex'
      flexWrap='wrap'
      my={2}
      borderRadius={10}
      py={1.5}
      className='bg-secondary2'
    >
      {farmIndex === GlobalConst.farmIndex.LPFARM_INDEX && (
        <>
          <Box
            width={isMobile ? 1 : 1 / 3}
            py={1.5}
            className='border-right text-center'
          >
            <Box mb={1}>
              <span className='text-secondary'>Reward Rate</span>
            </Box>
            <h6 className='weight-600'>
              {dQuickRewardSum.toLocaleString()} dQuick / Day
            </h6>
          </Box>
          {getRewardsSection(true)}
        </>
      )}
      {farmIndex === GlobalConst.farmIndex.DUALFARM_INDEX &&
        getRewardsSection(false)}
    </Box>
  );
};

export default React.memo(FarmRewards);
