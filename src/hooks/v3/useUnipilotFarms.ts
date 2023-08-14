import { useQuery } from '@tanstack/react-query';
import { ChainId } from '@uniswap/sdk';
import { useEffect, useState } from 'react';
import {
  getUnipilotFarmData,
  getUnipilotFarms,
  getUnipilotUserFarms,
} from 'utils';

export function useUnipilotFarms(chainId?: ChainId) {
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
    }, 30000);
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

export function useUnipilotUserFarms(chainId?: ChainId, account?: string) {
  const fetchUnipilotUserFarms = async () => {
    if (!chainId) return [];
    const unipilotFarms = await getUnipilotUserFarms(chainId, account);
    return unipilotFarms;
  };

  const {
    isLoading: farmsLoading,
    data,
    refetch: refetchUnipilotUserFarms,
  } = useQuery({
    queryKey: ['fetchUnipilotUserFarms', chainId, account],
    queryFn: fetchUnipilotUserFarms,
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
    refetchUnipilotUserFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: farmsLoading, data };
}
