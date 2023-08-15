import { Box, Grid, Typography } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

import { formatCompact, useLairDQUICKAPY } from 'utils';
import { useNewLairInfo } from 'state/stake/hooks';
import { DLQUICK } from 'constants/v3/addresses';
import { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';

import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';

interface AnalyticsInfoProps {
  data: any;
  chainId: any;
}

const AnalyticsExtraInfo: React.FC<AnalyticsInfoProps> = ({
  data,
  chainId,
}) => {
  const { t } = useTranslation();

  const [rewards, setRewards] = useState('0');
  const [totalTVL, setTotalTVL] = useState('0');
  const lairInfo = useNewLairInfo();
  const dQUICKAPY = useLairDQUICKAPY(true, lairInfo);
  const quickToken = DLQUICK[chainId];
  const quickPrice = useUSDCPriceFromAddress(quickToken?.address);

  useEffect(() => {
    if (lairInfo && quickPrice) {
      const balance = Number(lairInfo.totalQuickBalance.toExact());
      if (balance > 0) {
        const newReward = balance * quickPrice;
        const totalTVLValue = data.totalLiquidityUSD + newReward;

        const formattedReward = formatCompact(newReward, 18, 3, 3);
        // if (formattedReward !== rewards && rewards !== '0') {
        setRewards(formattedReward);
        // }

        const formattedTotalTVL = formatCompact(totalTVLValue, 18, 5, 5);
        // if (formattedTotalTVL !== totalTVL && totalTVL !== '0') {
        setTotalTVL(formattedTotalTVL);
        // }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickPrice, lairInfo, dQUICKAPY, data]);

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
