import React from 'react';
import { Box } from '@material-ui/core';
import LiquidityHubAnalyticsVolume from './LiquidityHubAnalyticsVolume';
import LiquidityHubAnalyticsTotal from './LiquidityHubAnalyticsTotal';
import LiquidityHubAnalyticsCoinVolume from './LiquidityHubAnalyticsCoinVolume';
import LiquidityHubAnalyticsSwap from './LiquidityHubAnalyticsSwap';
import { useTranslation } from 'react-i18next';

const LiquidityHubAnalytics: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box className='flex items-center' gridGap={16} mb={3}>
        <Box width={1 / 3} maxWidth='300px'>
          <LiquidityHubAnalyticsVolume />
        </Box>
        <Box width={1 / 3} maxWidth='300px'>
          <LiquidityHubAnalyticsVolume />
        </Box>
        <Box width={1 / 3} maxWidth='300px'>
          <LiquidityHubAnalyticsVolume />
        </Box>
      </Box>
      <Box mb={3}>
        <LiquidityHubAnalyticsTotal />
      </Box>
      <Box className='panel'>
        <p>{t('volumebycoin')}</p>
        <Box mt={2} width='100%'>
          <LiquidityHubAnalyticsCoinVolume />
        </Box>
      </Box>
      <Box my={3}>
        <h6>{t('lhSwaps')}</h6>
      </Box>
      <Box className='panel'>
        <LiquidityHubAnalyticsSwap />
      </Box>
    </>
  );
};

export default LiquidityHubAnalytics;
