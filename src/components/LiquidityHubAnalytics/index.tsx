import React from 'react';
import { Box, Grid } from '@material-ui/core';
import LiquidityHubAnalyticsVolume from './LiquidityHubAnalyticsVolume';
import LiquidityHubAnalyticsTotal from './LiquidityHubAnalyticsTotal';
import LiquidityHubAnalyticsCoinVolume from './LiquidityHubAnalyticsCoinVolume';
import LiquidityHubAnalyticsSwap from './LiquidityHubAnalyticsSwap';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const LiquidityHubAnalytics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box maxWidth={1000} mb={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <LiquidityHubAnalyticsVolume
              additionalText={t('liquidityhubvolumesincelaunch')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <LiquidityHubAnalyticsVolume
              timeLabel={t('last30days')}
              startTime={dayjs
                .utc(
                  dayjs
                    .utc()
                    .subtract(30, 'day')
                    .format('YYYY-MM-DD'),
                )
                .unix()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <LiquidityHubAnalyticsVolume
              timeLabel={t('last24hours')}
              startTime={dayjs
                .utc(
                  dayjs
                    .utc()
                    .subtract(1, 'day')
                    .format('YYYY-MM-DD'),
                )
                .unix()}
            />
          </Grid>
        </Grid>
      </Box>
      <Box mb={3}>
        <LiquidityHubAnalyticsTotal />
      </Box>
      <Box className='panel'>
        <LiquidityHubAnalyticsCoinVolume />
      </Box>
      <Box my={3} className='panel'>
        <LiquidityHubAnalyticsSwap />
      </Box>
    </>
  );
};

export default LiquidityHubAnalytics;
