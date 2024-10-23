import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useFetchBonds } from './useFetchBonds';

export const useBondType = (billAddress: string) => {
  const { chainId } = useActiveWeb3React();
  const { data: bonds } = useFetchBonds();
  const selectedBond = bonds?.find(
    (bond) =>
      bond?.contractAddress[chainId as ChainId]?.toLowerCase() ===
      billAddress?.toLowerCase(),
  );
  return selectedBond?.billType;
};

export const useBondTypes = (billAddresses: string[]) => {
  const { chainId } = useActiveWeb3React();
  const { data: bonds } = useFetchBonds();
  return billAddresses.map((billAddress) => {
    const selectedBond = bonds?.find(
      (bond) =>
        bond?.contractAddress[chainId as ChainId]?.toLowerCase() ===
        billAddress?.toLowerCase(),
    );
    return selectedBond?.billType;
  });
};
