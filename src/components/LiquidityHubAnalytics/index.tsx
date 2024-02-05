import React from 'react';
import { Box } from '@material-ui/core';
import LiquidityHubAnalyticsTotal from './LiquidityHubAnalyticsTotal';
import LiquidityHubAnalyticsCoinVolume from './LiquidityHubAnalyticsCoinVolume';
import LiquidityHubAnalyticsSwap from './LiquidityHubAnalyticsSwap';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@material-ui/lab';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';

const LiquidityHubAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/liquidityHub`,
      );
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return (data?.data?.data ?? []).map((item: any) => {
        const srcToken = getTokenFromAddress(
          item.srcTokenAddress,
          chainId,
          tokenMap,
          [],
        );
        const dstToken = getTokenFromAddress(
          item.dstTokenAddress,
          chainId,
          tokenMap,
          [],
        );
        return { ...item, srcToken, dstToken };
      });
    } catch {
      return [];
    }
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchLHAnalytics'],
    queryFn: fetchAnalyticsData,
    refetchInterval: 180 * 60 * 1000,
  });

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
