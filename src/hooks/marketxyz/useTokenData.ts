import { useActiveWeb3React } from 'hooks';
import { useMemo } from 'react';
import { useQuery, useQueries } from 'react-query';
import { fetchTokenData } from 'utils/marketxyz/fetchTokenData';

export const useTokenData = (address: string) => {
  const { chainId } = useActiveWeb3React();
  const { data: tokenData } = useQuery(
    address + ' tokenData',
    async () => await fetchTokenData(address, chainId),
  );
  return tokenData;
};

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

    if (!tokensData.length) return null;

    // Return null altogether
    tokensData.forEach(({ data }) => {
      if (!data) return null;
      ret.push(data);
    });

    if (!ret.length) return null;

    return ret;
  }, [tokensData]);
};
