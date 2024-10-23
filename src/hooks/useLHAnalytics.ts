import { useQuery } from '@tanstack/react-query';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';

export const useLHAnalyticsDaily = () => {
  const fetchAnalyticsDaily = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/liquidityHubDaily`,
      );
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data?.data?.data;
    } catch {
      return [];
    }
  };

  return useQuery({
    queryKey: ['fetchLHAnalyticsDaily'],
    queryFn: fetchAnalyticsDaily,
    refetchInterval: 180 * 60 * 1000,
  });
};

export const useLHAnalytics = (startTime?: number, endTime?: number) => {
  const { chainId } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/liquidityHub${
          startTime || endTime
            ? `?${startTime ? `startTime=${startTime}&` : ''}${
                endTime ? `endTime=${endTime}` : ''
              }`
            : ''
        }`,
      );
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return (data?.data ?? []).map((item: any) => {
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

  return useQuery({
    queryKey: ['fetchLHAnalytics', startTime, endTime],
    queryFn: fetchAnalyticsData,
    refetchInterval: 180 * 60 * 1000,
  });
};
