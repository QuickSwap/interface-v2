import { useQuery } from '@tanstack/react-query';
import { useActiveWeb3React } from 'hooks';
import { useEffect, useState } from 'react';
import BondABI from 'constants/abis/bond.json';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import { Interface } from 'ethers/lib/utils';

export const useFetchBonds = () => {
  const { chainId } = useActiveWeb3React();
  const fetchBonds = async () => {
    try {
      const bondsURL = process.env.REACT_APP_BONDS_URL;
      if (!bondsURL) return [];
      const bondsRes = await fetch(bondsURL);
      const bonds = await bondsRes.json();
      if (!bonds) return [];
      const qsBonds = bonds.filter(
        (bond: any) =>
          bond &&
          bond.contractAddress &&
          bond.contractAddress[chainId] &&
          bond.bondPartner === 'QuickSwap',
      );
      return qsBonds;
    } catch {
      return [];
    }
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['fetchQuickswapBonds', chainId],
    queryFn: fetchBonds,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  return { loading: isLoading, data };
};

export const useFetchBondsFromContract = (bondAddresses: string[]) => {
  const bondInterface = new Interface(BondABI);
  const bondTrueBillPriceCalls = useMultipleContractSingleData(
    bondAddresses,
    bondInterface,
    'trueBillPrice',
  );
  const bondTrueBillPrices = bondTrueBillPriceCalls.map((call) =>
    !call.loading && call.result && call.result.length > 0
      ? call.result[0]
      : undefined,
  );
  return bondAddresses.map((address, index) => {
    return { address, trueBillPrice: bondTrueBillPrices[index] };
  });
};
