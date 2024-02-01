import React from 'react';
import { Box } from '@material-ui/core';
import LiquidityHubAnalyticsTotal from './LiquidityHubAnalyticsTotal';
import LiquidityHubAnalyticsCoinVolume from './LiquidityHubAnalyticsCoinVolume';
import LiquidityHubAnalyticsSwap from './LiquidityHubAnalyticsSwap';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@material-ui/lab';
import dayjs from 'dayjs';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';
import { useActiveWeb3React } from 'hooks';

const LiquidityHubAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const currentTime = dayjs.utc().format('YYYY-MM-DDTHH:mm:ss');
  const tokenMap = useSelectedTokenList();

  const fetchAnalyticsData = async () => {
    const items: any[] = [];
    let allFetched = false;
    let endTime = currentTime + '.000Z';
    while (!allFetched) {
      const apiURL = `https://hub.orbs.network/analytics/v2?start=2023-01-18T00:00:00.000Z&end=${endTime}`;
      try {
        const res = await fetch(apiURL);
        const data = await res.json();
        const hits = data?.hits?.hits ?? [];
        if (hits.length < 500) {
          allFetched = true;
        }
        const filteredHits = hits.filter(
          (item: any) => item?.fields?.timestamp && item?.fields?.timestamp[0],
        );
        endTime = filteredHits[filteredHits.length - 1].fields.timestamp[0];
        for (const item of data?.hits?.hits ?? []) {
          if (
            item?.fields?.srcTokenSymbol &&
            item?.fields?.dstTokenSymbol &&
            item?.fields?.srcAmount &&
            item?.fields?.dexAmountOut &&
            item?.fields?.dstTokenUsdValue &&
            item?.fields?.txHash &&
            item?.fields?.timestamp
          ) {
            const srcTokenAddress = item.fields.srcTokenAddress[0];
            const srcToken = getTokenFromAddress(
              srcTokenAddress,
              chainId,
              tokenMap,
              [],
            );
            const dstTokenAddress = item.fields.dstTokenAddress[0];
            const dstToken = getTokenFromAddress(
              dstTokenAddress,
              chainId,
              tokenMap,
              [],
            );
            items.push({
              srcTokenSymbol: item.fields.srcTokenSymbol[0],
              srcTokenAddress,
              srcToken,
              dstTokenSymbol: item.fields.dstTokenSymbol[0],
              dstTokenAddress,
              dstToken,
              srcAmount: item.fields.srcAmount[0],
              dexAmountOut: item.fields.dexAmountOut[0],
              dexAmountUSD: item.fields.dstTokenUsdValue[0],
              txHash: item.fields.txHash[0],
              timestamp: item.fields.timestamp[0],
            });
          }
        }
      } catch (e) {
        console.log('error fetching liquidity hub analytics data', e);
      }
    }
    return items;
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchLHAnalytics'],
    queryFn: fetchAnalyticsData,
    refetchInterval: 600000,
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
