import { Box, Grid } from '@mui/material';
import Skeleton from '@mui/lab/Skeleton';

import { formatCompact } from 'utils';
import { useNewLairInfo } from 'state/stake/hooks';
import { DLQUICK } from 'constants/v3/addresses';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';

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
  const quickPrice = useUSDCPriceFromAddress(quickToken?.address);

  const rewards = useMemo(() => {
    if (lairInfo && quickPrice) {
      const balance = Number(lairInfo.totalQuickBalance.toExact());
      const newReward = balance * quickPrice;

      const formattedReward = formatCompact(newReward, 18, 3, 3);
      return formattedReward;
    }
    return '0';
  }, [lairInfo, quickPrice]);

  const totalTVL = useMemo(() => {
    if (lairInfo && quickPrice) {
      const balance = Number(lairInfo.totalQuickBalance.toExact());
      const newReward = balance * quickPrice;
      const totalTVLValue = (data?.totalLiquidityUSD ?? 0) + newReward;
      const formattedTotalTVL = formatCompact(totalTVLValue, 18, 5, 5);
      return formattedTotalTVL;
    }
    return '0';
  }, [data?.totalLiquidityUSD, lairInfo, quickPrice]);

  return (
    <Box mb={3}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={12} md={4}>
          <Box className='panel'>
            <span className='text-disabled text-bold text-uppercase'>
              {t('totalTVL')}
            </span>
            {totalTVL === '0' ? (
              <Skeleton width='100%' height={40} />
            ) : (
              <h5>${totalTVL}</h5>
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Box className='panel'>
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
          <Box className='panel'>
            <span className='text-disabled text-bold text-uppercase'>
              {t('dragonLair')}
            </span>
            {totalTVL === '0' ? (
              <Skeleton width='100%' height={40} />
            ) : (
              <h5>${rewards}</h5>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsExtraInfo;
