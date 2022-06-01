import React, { useMemo } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { useUSDRewardsandFees } from 'state/stake/hooks';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { returnStakingInfo } from 'utils';
import { useTranslation } from 'react-i18next';

const FarmRewards: React.FC<{ farmIndex: number; bulkPairs: any }> = ({
  farmIndex,
  bulkPairs,
}) => {
  const { t } = useTranslation();
  const { palette, breakpoints } = useTheme();
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
        borderRight={isMobile ? 'none' : `1px solid ${palette.divider}`}
        textAlign='center'
      >
        <Box mb={1}>
          <Typography variant='caption' color='textSecondary'>
            {t('totalRewards')}
          </Typography>
        </Box>
        {farmData.rewardsUSD ? (
          <Typography variant='subtitle2' style={{ fontWeight: 600 }}>
            ${farmData.rewardsUSD.toLocaleString()} / {t('day')}
          </Typography>
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
          <Typography variant='caption' color='textSecondary'>
            {t('fees24h')}
          </Typography>
        </Box>
        {farmData.stakingFees ? (
          <Typography variant='subtitle2' style={{ fontWeight: 600 }}>
            ${farmData.stakingFees.toLocaleString()}
          </Typography>
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
      bgcolor={palette.secondary.dark}
    >
      {farmIndex === GlobalConst.farmIndex.LPFARM_INDEX && (
        <>
          <Box
            width={isMobile ? 1 : 1 / 3}
            py={1.5}
            borderRight={`1px solid ${palette.divider}`}
            textAlign='center'
          >
            <Box mb={1}>
              <Typography variant='caption' color='textSecondary'>
                {t('rewardRate')}
              </Typography>
            </Box>
            <Typography variant='subtitle2' style={{ fontWeight: 600 }}>
              {dQuickRewardSum.toLocaleString()} dQuick / {t('day')}
            </Typography>
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
