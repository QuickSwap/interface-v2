import { useQuery } from '@tanstack/react-query';
import { useActiveWeb3React } from 'hooks';
import { useTokenLockerContract } from 'hooks/useContract';

export const useGetFeesAndWhitelistedWallet = (lpAddress?: string) => {
  const { account, chainId } = useActiveWeb3React();
  const tokenLockerContract = useTokenLockerContract(chainId, undefined, false);

  const tokenLockerContractInitialized = !!tokenLockerContract;

  return useQuery({
    queryKey: [
      'lp-feeInETH-whitelisted-wallet',
      tokenLockerContractInitialized,
      lpAddress,
      account,
    ],
    queryFn: async () => {
      if (!tokenLockerContract || !lpAddress || !account) return null;
      const feesInETH = await tokenLockerContract.getFeesInETH(lpAddress);
      const isWhitelisted = await tokenLockerContract.whitelistedWallets(
        account,
      );
      return { fee: feesInETH, isWhitelisted };
    },
  });
};
