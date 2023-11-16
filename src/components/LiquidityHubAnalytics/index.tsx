import React, { useEffect, useState } from 'react';
import { Box } from '@material-ui/core';
import LiquidityHubAnalyticsTotal from './LiquidityHubAnalyticsTotal';
import LiquidityHubAnalyticsCoinVolume from './LiquidityHubAnalyticsCoinVolume';
import LiquidityHubAnalyticsSwap from './LiquidityHubAnalyticsSwap';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@material-ui/lab';

const LiquidityHubAnalytics: React.FC = () => {
  const { t } = useTranslation();

  const fetchAnalyticsData = async () => {
    const apiURL = 'https://hub.orbs.network/analytics/v1';
    try {
      const res = await fetch(apiURL);
      const data = await res.json();
      return data && data.result && data.result.rows ? data.result.rows : [];
    } catch {
      return [];
    }
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchLHAnalytics'],
    queryFn: fetchAnalyticsData,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return (
    <>
      <Box mb={3}>
        <LiquidityHubAnalyticsTotal />
      </Box>
      <Box className='panel'>
        <p>{t('volumebycoin')}</p>
        <Box mt={2} width='100%'>
          {isLoading ? (
            <Skeleton width='100%' height={400} />
          ) : (
            <LiquidityHubAnalyticsCoinVolume data={data} />
          )}
        </Box>
      </Box>
      <Box my={3}>
        <h6>{t('lhSwaps')}</h6>
      </Box>
      <Box className='panel'>
        {isLoading ? (
          <Skeleton width='100%' height={400} />
        ) : (
          <LiquidityHubAnalyticsSwap data={data} />
        )}
      </Box>
    </>
  );
};

export default LiquidityHubAnalytics;
