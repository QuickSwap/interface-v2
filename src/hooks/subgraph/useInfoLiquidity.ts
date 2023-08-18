import React, { useEffect, useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { useQuery } from '@tanstack/react-query';

export function useInfoLiquidity() {
  const { chainId } = useActiveWeb3React();

  async function fetchPopularPools() {
    if (!chainId) return null;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/popular-pools?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const pools: any[] =
        data && data.data && data.data.pools ? data.data.pools : [];
      const mappedPools = pools.map(({ token0, token1 }) => [
        token0.id.toLowerCase(),
        token1.id.toLowerCase(),
      ]);
      return mappedPools;
    } catch (err) {
      console.error('total stats failed', err);
      return null;
    }
  }

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchPopularPools', chainId],
    queryFn: fetchPopularPools,
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
}
