import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { useEffect, useState } from 'react';

export const useAnalyticsGlobalData = (version: string, chainId: ChainId) => {
  const fetchGlobalData = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/global-data/${version}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data && data.data ? data.data : null;
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchAnalyticsGlobalData', version, chainId],
    queryFn: fetchGlobalData,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

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
      return null;
    }
    const data = await res.json();
    return data && data.data ? data.data : null;
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchAnalyticsTopTokens', version, chainId, limit],
    queryFn: fetchTopTokens,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { isLoading, data };
};

export const useAnalyticsTopPairs = (version: string, chainId: ChainId) => {
  const fetchTopPairs = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-pairs/${version}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data && data.data ? data.data : null;
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchAnalyticsTopPairs', version, chainId],
    queryFn: fetchTopPairs,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { isLoading, data };
};

export const useAnalyticsTokenDetails = (
  tokenAddress: string,
  version: string,
  chainId: ChainId,
) => {
  const fetchTokenDetails = async () => {
    if (chainId && version) {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/analytics/top-token-details/${tokenAddress}/${version}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data && data.data ? data.data : null;
    }
    return;
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchAnalyticsTokenDetails', tokenAddress, version, chainId],
    queryFn: fetchTokenDetails,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { isLoading, data };
};
