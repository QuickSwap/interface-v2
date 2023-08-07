import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { useEffect, useState } from 'react';
import { getUnipilotFarmData, getUnipilotFarms } from 'utils';

export function useUnipilotFarms(chainId: ChainId | undefined) {
  const fetchUnipilotFarms = async () => {
    if (!chainId) return [];
    const unipilotFarms = await getUnipilotFarms(chainId);
    return unipilotFarms;
  };

  const {
    isLoading: farmsLoading,
    data,
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
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetchUnipilotFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: farmsLoading, data };
}

export function useUnipilotFarmData(
  farmAddresses?: string[],
  chainId?: ChainId,
) {
  const fetchUnipilotFarmData = async () => {
    if (!chainId) return;
    const unipilotFarms = await getUnipilotFarmData(farmAddresses, chainId);
    return unipilotFarms;
  };

  const { isLoading, data, refetch: refetchUnipilotFarmData } = useQuery({
    queryKey: ['fetchUnipilotFarmData', farmAddresses, chainId],
    queryFn: fetchUnipilotFarmData,
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
    refetchUnipilotFarmData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: isLoading, data };
}
