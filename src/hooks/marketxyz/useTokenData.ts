import { useActiveWeb3React } from 'hooks';
import { useMemo } from 'react';
import { useQueries } from 'react-query';
import { fetchTokenData } from 'utils/marketxyz/fetchTokenData';

export const useTokensData = (addresses: string[]) => {
  const { chainId } = useActiveWeb3React();
  const tokensData = useQueries(
    addresses.map((address: string) => {
      return {
        queryKey: address + ' tokenData',
        queryFn: async () => await fetchTokenData(address, chainId),
      };
    }),
  );

  return useMemo(() => {
    const ret: any[] = [];

    if (!tokensData.length) return;

    // Return null altogether
    tokensData.forEach(({ data }) => {
      if (!data) return null;
      ret.push(data);
    });

    if (!ret.length) return;

    return ret;
  }, [tokensData]);
};

export const useTokenData = (address: string) => {
  const tokensData = useTokensData([address]);
  if (!tokensData) return;
  return tokensData[0];
};
