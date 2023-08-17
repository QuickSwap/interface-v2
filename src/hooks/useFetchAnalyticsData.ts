import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';

export const useAnalyticsGlobalData = (version: string, chainId: ChainId) => {
  const fetchGlobalData = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/global-data/${version}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return;
    }

    const data = await res.json();
    return data && data.data ? data.data : undefined;
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchAnalyticsGlobalData', version, chainId],
    queryFn: fetchGlobalData,
  });

  return { isLoading, data };
};

export const useAnalyticsTopTokens = (
  version: string,
  chainId: ChainId,
  limit?: number,
) => {
  const fetchTopTokens = async () => {
    const res = await fetch(
      `${
        process.env.REACT_APP_LEADERBOARD_APP_URL
      }/analytics/top-tokens/${version}?chainId=${chainId}${
        limit ? `&limit=${limit}` : ''
      }`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    return data && data.data ? data.data : undefined;
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchAnalyticsTopTokens', version, chainId, limit],
    queryFn: fetchTopTokens,
  });

  return { isLoading, data };
};

export const useAnalyticsTopPairs = (version: string, chainId: ChainId) => {
  const fetchTopPairs = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-pairs/${version}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    return data && data.data ? data.data : undefined;
  };

  const { isLoading, data } = useQuery({
    queryKey: ['fetchAnalyticsTopPairs', version, chainId],
    queryFn: fetchTopPairs,
  });

  return { isLoading, data };
};
