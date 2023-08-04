import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { useEffect, useState } from 'react';
import { getUnipilotFarms } from 'utils';

export function useUnipilotFarms(chainId: ChainId | undefined) {
  const fetchUnipilotFarms = async () => {
    if (!chainId) return;
    const unipilotFarms = await getUnipilotFarms(chainId);
    return unipilotFarms;
  };

  const {
    isLoading: farmsLoading,
    data: unipilotFarms,
    refetch: refetchUnipilotFarms,
  } = useQuery({
    queryKey: ['fetchUnipilotFarms', chainId],
    queryFn: fetchUnipilotFarms,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetchUnipilotFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: farmsLoading, unipilotFarms };
}
