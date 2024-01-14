import { Box, Grid } from '@mui/material';
import Skeleton from '@mui/lab/Skeleton';
import { formatCompact } from 'utils';
import { useNewLairInfo } from 'state/stake/hooks';
import { DLQUICK } from 'constants/v3/addresses';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';
import styles from 'styles/pages/Analytics.module.scss';

interface AnalyticsInfoProps {
  data: any;
  chainId: any;
}

const AnalyticsExtraInfo: React.FC<AnalyticsInfoProps> = ({
  data,
  chainId,
}) => {
  const { t } = useTranslation();

  const lairInfo = useNewLairInfo();
  const quickToken = DLQUICK[chainId];
  const { price: quickPrice } = useUSDCPriceFromAddress(quickToken?.address);

  const extraInfo = useMemo(() => {
    if (lairInfo && quickPrice) {
      const balance = Number(lairInfo.totalQuickBalance.toExact());
      if (balance > 0) {
        const newReward = balance * quickPrice;
        const totalTVLValue = (data?.totalLiquidityUSD ?? 0) + newReward;
        const formattedReward = formatCompact(newReward, 18, 3, 3);
        const formattedTotalTVL = formatCompact(totalTVLValue, 18, 5, 5);
        return { rewards: formattedReward, totalTVL: formattedTotalTVL };
      }
      return;
    }
    return;
  }, [data?.totalLiquidityUSD, lairInfo, quickPrice]);

  return (
    <Box mb={3}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          <Box className={styles.panel}>
            <span className='text-disabled text-bold text-uppercase'>
              {t('totalTVL')}
            </span>
            {extraInfo && extraInfo.totalTVL ? (
              <h5>${extraInfo.totalTVL}</h5>
            ) : (
              <Skeleton width='100%' height={40} />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Box className={styles.panel}>
            <span className='text-disabled text-bold text-uppercase'>
              {t('liquidityLocked')}
            </span>
            {data ? (
              <h5>${formatCompact(data.totalLiquidityUSD, 18, 5, 5)}</h5>
            ) : (
              <Skeleton width='100%' height={40} />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Box className={styles.panel}>
            <span className='text-disabled text-bold text-uppercase'>
              {t('dragonLair')}
            </span>
            {extraInfo && extraInfo.rewards ? (
              <h5>${extraInfo.rewards}</h5>
            ) : (
              <Skeleton width='100%' height={40} />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsExtraInfo;
