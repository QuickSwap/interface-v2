import { ChainId, Token } from '@uniswap/sdk';
import { IchiVaults } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import { getTokenFromAddress } from 'utils';
import ICHIVaultABI from 'constants/abis/ichi-vault.json';
import { Interface, formatUnits } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { SupportedDex, getTotalAmounts } from '@ichidao/ichi-vaults-sdk';
import { useQuery } from '@tanstack/react-query';
import { Web3Provider } from '@ethersproject/providers';

export interface ICHIVault {
  token0?: Token;
  token1?: Token;
  address: string;
  fee?: number;
}

const fetchVaultAPR = async (
  vault: ICHIVault,
  provider: Web3Provider,
  chainId: ChainId,
  usdPrices: {
    address: string;
    price: any;
  }[],
) => {
  try {
    const vaultFeesRes = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/ichi-vault-fees?address=${vault.address}&chainId=${chainId}`,
    );
    if (vaultFeesRes.ok) {
      const vaultFeesData = await vaultFeesRes.json();
      const vaultFees = vaultFeesData?.data?.fees ?? [];
      const usdPriceToken0 =
        usdPrices.find(
          (item) =>
            vault.token0 &&
            item.address.toLowerCase() === vault.token0.address.toLowerCase(),
        )?.price ?? 0;
      const usdPriceToken1 =
        usdPrices.find(
          (item) =>
            vault.token1 &&
            item.address.toLowerCase() === vault.token1.address.toLowerCase(),
        )?.price ?? 0;
      const endTime =
        vaultFees.length > 0 ? vaultFees[0]?.createdAtTimestamp : undefined;
      const startTime =
        vaultFees.length > 0
          ? vaultFees[vaultFees.length - 1]?.createdAtTimestamp
          : undefined;
      const timeDuration = Number(endTime ?? 0) - Number(startTime ?? 0);
      const usdAmountSum = vaultFees.reduce((sum: number, item: any) => {
        const feeAmount0 = Number(
          formatUnits(item.feeAmount0, vault.token0?.decimals),
        );
        const feeAmount1 = Number(
          formatUnits(item.feeAmount1, vault.token1?.decimals),
        );
        return sum + feeAmount0 * usdPriceToken0 + feeAmount1 * usdPriceToken1;
      }, 0);
      if (timeDuration > 0) {
        const avgFee24hUSD =
          timeDuration > 0 ? (usdAmountSum / timeDuration) * 3600 * 24 : 0;
        try {
          const totalAmounts = await getTotalAmounts(
            vault.address.toLowerCase(),
            provider,
            SupportedDex.Quickswap,
          );
          const tvlUSD =
            Number(totalAmounts?.total0 ?? 0) * usdPriceToken0 +
            Number(totalAmounts?.total1 ?? 0) * usdPriceToken1;
          const apr = tvlUSD > 0 ? (avgFee24hUSD * 365) / tvlUSD : 0;
          return apr;
        } catch (e) {
          console.log('Err in fetching ICHI Vault total amount', e);
          return 0;
        }
      }
    }
    return 0;
  } catch (e) {
    console.log('Err in fetching ICHI fees', e);
    return 0;
  }
};

export const useICHIVaultAPR = (
  vault: ICHIVault,
  usdPrices?: {
    address: string;
    price: any;
  }[],
) => {
  const { provider, chainId } = useActiveWeb3React();
  const { isLoading, data: apr } = useQuery({
    queryKey: [
      'ichi-vault-apr',
      vault.address,
      usdPrices?.map((item) => item.price).join('_'),
      chainId,
    ],
    queryFn: async () => {
      if (!provider || !usdPrices) return 0;
      const apr = await fetchVaultAPR(vault, provider, chainId, usdPrices);
      return apr;
    },
    enabled: !!provider && !!usdPrices,
  });
  return { isLoading, apr };
};

export const useICHIVaults = () => {
  const { chainId } = useActiveWeb3React();
  const vaults = IchiVaults[chainId];
  const tokenMap = useSelectedTokenList();
  const vaultAddresses = vaults?.map((item) => item.address) ?? [];

  const feeCalls = useMultipleContractSingleData(
    vaultAddresses,
    new Interface(ICHIVaultABI),
    'fee',
    [],
  );

  return useMemo(() => {
    if (!vaults) return [];
    return vaults.map((vault, index) => {
      const token0 = getTokenFromAddress(vault.token0, chainId, tokenMap, []);
      const token1 = getTokenFromAddress(vault.token1, chainId, tokenMap, []);
      const feeCallData = feeCalls[index];
      const fee =
        !feeCallData.loading && feeCallData.result
          ? Number(feeCallData.result) / 10000
          : undefined;
      return { address: vault.address, fee, token0, token1 };
    });
  }, [chainId, feeCalls, tokenMap, vaults]);
};
