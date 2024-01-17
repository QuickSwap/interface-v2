import React, { useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { useUSDRewardsandFees } from 'state/stake/hooks';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { useTranslation } from 'next-i18next';
import { useDefaultFarmList } from 'state/farms/hooks';
import { ChainId } from '@uniswap/sdk';
import { useRouter } from 'next/router';
import styles from 'styles/pages/Farm.module.scss';

const FarmRewards: React.FC<{ bulkPairs: any }> = ({ bulkPairs }) => {
  const router = useRouter();
  const currentTab = router.query.tab
    ? (router.query.tab as string)
    : GlobalConst.v2FarmTab.LPFARM;
  const { t } = useTranslation();
  const { breakpoints } = useTheme();
  const { chainId } = useActiveWeb3React();
  const defaultChainId = chainId ?? ChainId.MATIC;
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const farmData = useUSDRewardsandFees(
    currentTab === GlobalConst.v2FarmTab.LPFARM,
    bulkPairs,
    defaultChainId,
  );

  const farms = useDefaultFarmList()[defaultChainId];
  const dQuickRewardSum = useMemo(() => {
    const rewardSum = Object.values(farms)
      .filter((x) => !x.ended)
      .reduce((total, item) => total + item.rate, 0);
    return rewardSum;
  }, [farms]);

  const getRewardsSection = (isLPFarm: boolean) => (
    <>
      <Box
        width={isMobile ? 1 : isLPFarm ? 1 / 3 : 1 / 2}
        p={1.5}
        className={`text-center ${isMobile ? '' : 'border-right'}`}
      >
        <Box mb={1}>
          <span className='text-secondary'>{t('totalRewards')}</span>
        </Box>
        {farmData.rewardsUSD ? (
          <h6 className='weight-600'>
            ${farmData.rewardsUSD.toLocaleString('us')} / {t('day')}
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
          <span className='text-secondary'>{t('fees24h')}</span>
        </Box>
        {farmData.stakingFees ? (
          <h6 className='weight-600'>
            ${farmData.stakingFees.toLocaleString('us')}
          </h6>
        ) : (
          <Skeleton width='100%' height='28px' />
        )}
      </Box>
    </>
  );

  return (
    <Box className={styles.farmRewards}>
      {currentTab === GlobalConst.v2FarmTab.LPFARM && (
        <>
          <Box
            width={isMobile ? 1 : 1 / 3}
            py={1.5}
            className='text-center border-right'
          >
            <Box mb={1}>
              <span className='text-secondary'>{t('rewardRate')}</span>
            </Box>
            <h6 className='weight-600'>
              {dQuickRewardSum.toLocaleString('us')} dQuick / {t('day')}
            </h6>
          </Box>
          {getRewardsSection(true)}
        </>
      )}
      {currentTab === GlobalConst.v2FarmTab.DUALFARM &&
        getRewardsSection(false)}
    </Box>
  );
};

export default React.memo(FarmRewards);
