import { useState } from 'react';
import { useActiveWeb3React } from 'hooks';

export function useInfoLiquidity() {
  const { chainId } = useActiveWeb3React();

  const [popularPools, setPopularPools] = useState<
    [string, string][] | undefined
  >();
  const [popularPoolsLoading, setPopularPoolsLoading] = useState<boolean>(
    false,
  );

  async function fetchPopularPools() {
    if (!chainId) return;
    try {
      setPopularPoolsLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/popular-pools?chainId=${chainId}`,
      );
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          errorText || res.statusText || `Failed to fetch popular pools`,
        );
      }
      const data = await res.json();
      const pools: any[] =
        data && data.data && data.data.pools ? data.data.pools : [];

      setPopularPools(
        pools.map(({ token0, token1 }) => [
          token0.id.toLowerCase(),
          token1.id.toLowerCase(),
        ]),
      );
    } catch (err) {
      console.error('total stats failed', err);
      // setTotalStats('Failed')
    }
    setPopularPoolsLoading(false);
  }

  return {
    fetchPopularPools: {
      popularPools,
      popularPoolsLoading,
      fetchPopularPoolsFn: fetchPopularPools,
    },
  };
}
