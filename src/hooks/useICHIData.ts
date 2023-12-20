import { ChainId, ETHER, JSBI, WETH } from '@uniswap/sdk';
import { IchiVaults } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import { useSelectedTokenList } from 'state/lists/hooks';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import { getTokenFromAddress } from 'utils';
import ICHIVaultABI from 'constants/abis/ichi-vault.json';
import { Interface, formatUnits, parseUnits } from 'ethers/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import {
  SupportedDex,
  getIchiVaultInfo,
  getMaxDepositAmount,
  getTotalAmounts,
  getTotalSupply,
  getUserBalance,
  isDepositTokenApproved,
  getUserAmounts,
} from '@ichidao/ichi-vaults-sdk';
import { useQuery } from '@tanstack/react-query';
import { Web3Provider } from '@ethersproject/providers';
import { Currency, Token } from '@uniswap/sdk-core';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { toV3Token } from 'constants/v3/addresses';
import { BigNumber } from 'ethers';

export interface ICHIVault {
  allowToken0?: boolean;
  allowToken1?: boolean;
  token0?: Token;
  token1?: Token;
  address: string;
  fee?: number;
  balance?: number;
  balanceBN?: BigNumber;
  token0Balance?: number;
  token1Balance?: number;
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
  const { chainId, provider } = useActiveWeb3React();
  const vaultAddresses = useMemo(() => {
    const vaults = IchiVaults[chainId];
    if (!vaults) return [];
    return vaults;
  }, [chainId]);
  const tokenMap = useSelectedTokenList();

  const feeCalls = useMultipleContractSingleData(
    vaultAddresses,
    new Interface(ICHIVaultABI),
    'fee',
    [],
  );

  const { isLoading: loadingVaultsInfo, data: vaultsInfo } = useQuery({
    queryKey: ['ichi-vaults-info', vaultAddresses.join('-')],
    queryFn: async () => {
      const vaults = await Promise.all(
        vaultAddresses.map(async (address) => {
          try {
            const vaultInfo = await getIchiVaultInfo(
              Number(chainId),
              SupportedDex.Quickswap,
              address,
              provider,
            );
            return { ...vaultInfo, address };
          } catch (e) {
            console.log('Err fetching ichi vault info', e);
            return null;
          }
        }),
      );
      return vaults;
    },
    enabled: !!provider,
  });

  const loading = loadingVaultsInfo || !!feeCalls.find((call) => call.loading);

  return useMemo(() => {
    return {
      loading,
      data: vaultAddresses.map((address, index) => {
        const vaultInfo = vaultsInfo?.find(
          (item) =>
            item && item.address.toLowerCase() === address.toLowerCase(),
        );
        const token0Address = vaultInfo?.tokenA;
        const token1Address = vaultInfo?.tokenB;
        const token0 = token0Address
          ? getTokenFromAddress(token0Address, chainId, tokenMap, [])
          : undefined;
        const token1 = token1Address
          ? getTokenFromAddress(token1Address, chainId, tokenMap, [])
          : undefined;
        const feeCallData = feeCalls[index];
        const fee =
          !feeCallData.loading && feeCallData.result && feeCallData.result[0]
            ? Number(feeCallData.result[0]) / 10000
            : undefined;
        return {
          address,
          fee,
          token0: token0 ? toV3Token(token0) : undefined,
          token1: token1 ? toV3Token(token1) : undefined,
          allowToken0: vaultInfo?.allowTokenA,
          allowToken1: vaultInfo?.allowTokenB,
        };
      }),
    };
  }, [loading, vaultAddresses, vaultsInfo, chainId, tokenMap, feeCalls]);
};

export const useICHIVaultTotalSupply = (vault?: ICHIVault) => {
  const { provider } = useActiveWeb3React();
  const lastTx = useLastTransactionHash();
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ichi-vault-total-supply', vault?.address],
    queryFn: async () => {
      if (!vault || !provider) return null;
      const totalSupply = await getTotalSupply(
        vault.address,
        provider,
        SupportedDex.Quickswap,
      );
      return Number(totalSupply);
    },
    enabled: !!vault && !!provider,
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
  }, [currentTime, lastTx]);
  return { isLoading, data };
};

export const useICHIVaultUserBalances = (vaults: ICHIVault[]) => {
  const { account, provider } = useActiveWeb3React();
  const lastTx = useLastTransactionHash();
  const { isLoading, data, refetch } = useQuery({
    queryKey: [
      'ichi-vaults-user-balance',
      account,
      vaults.map(({ address }) => address).join('_'),
    ],
    queryFn: async () => {
      if (!account || !provider) return;
      const vaultBalances = await Promise.all(
        vaults.map(async (vault) => {
          const balance = await getUserBalance(
            account,
            vault.address,
            provider,
            SupportedDex.Quickswap,
            true,
          );
          return {
            address: vault.address,
            balance: Number(formatUnits(balance)),
            balanceBN: balance,
          };
        }),
      );
      return vaultBalances;
    },
    enabled: !!account && !!provider,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);
  return { isLoading, data };
};

export const useICHIVaultsUserAmounts = (vaults: ICHIVault[]) => {
  const { account, provider } = useActiveWeb3React();
  const lastTx = useLastTransactionHash();
  const { isLoading, data, refetch } = useQuery({
    queryKey: [
      'ichi-vaults-user-amounts',
      account,
      vaults.map(({ address }) => address).join('_'),
    ],
    queryFn: async () => {
      if (!account || !provider) return;
      const userAmounts = await Promise.all(
        vaults.map(async (vault) => {
          const amounts = await getUserAmounts(
            account,
            vault.address,
            provider,
            SupportedDex.Quickswap,
          );
          return { address: vault.address, amounts };
        }),
      );
      return userAmounts;
    },
    enabled: !!account && !!provider,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);
  return { isLoading, data };
};

export const useICHIVaultUserBalance = (vault?: ICHIVault) => {
  const { account, provider } = useActiveWeb3React();
  const lastTx = useLastTransactionHash();
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['ichi-vault-user-balance', vault?.address, account],
    queryFn: async () => {
      if (!vault || !account || !provider) return null;
      const balance = await getUserBalance(
        account,
        vault.address,
        provider,
        SupportedDex.Quickswap,
      );
      return Number(balance);
    },
    enabled: !!vault && !!account && !!provider,
  });

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);
  return { isLoading, data };
};

export const useICHIVaultShare = (vault?: ICHIVault) => {
  const {
    isLoading: loadingTotalSupply,
    data: totalSupply,
  } = useICHIVaultTotalSupply(vault);
  const {
    isLoading: loadingUserBalance,
    data: userBalance,
  } = useICHIVaultUserBalance(vault);
  const vaultShare = useMemo(() => {
    if (!totalSupply) return 0;
    return ((userBalance ?? 0) / totalSupply) * 100;
  }, [totalSupply, userBalance]);

  return {
    loading: loadingTotalSupply || loadingUserBalance,
    data: vaultShare,
  };
};

export const useICHIVaultApproval = (
  vault?: ICHIVault,
  amount?: number,
  tokenIdx?: 0 | 1,
) => {
  const { account, provider } = useActiveWeb3React();
  const lastTx = useLastTransactionHash();
  const { isLoading, data } = useQuery({
    queryKey: [
      'ichi-deposit-approval',
      account,
      vault?.address,
      amount,
      tokenIdx,
      lastTx,
    ],
    queryFn: async () => {
      if (
        !account ||
        !vault ||
        !provider ||
        tokenIdx === undefined ||
        amount === undefined
      )
        return null;
      try {
        const approved = await isDepositTokenApproved(
          account,
          tokenIdx,
          amount,
          vault.address,
          provider,
          SupportedDex.Quickswap,
        );
        return approved;
      } catch (e) {
        console.log('Error getting ichi vault approval', e);
        return null;
      }
    },
  });

  return { isLoading, data };
};

export const useICHIVaultDepositData = (
  amount: number,
  currency?: Currency,
  vault?: ICHIVault,
) => {
  const { chainId, account, provider } = useActiveWeb3React();
  const isNativeToken =
    currency &&
    currency.wrapped.address.toLowerCase() ===
      WETH[chainId].address.toLowerCase();
  const tokenBalance = useCurrencyBalance(account, currency);
  const ethBalance = useCurrencyBalance(account, ETHER[chainId]);
  const wethBalance = useCurrencyBalance(account, WETH[chainId]);
  const ethBalanceBN = ethBalance?.numerator ?? JSBI.BigInt(0);
  const wethBalanceBN = wethBalance?.numerator ?? JSBI.BigInt(0);
  const tokenBalanceBN = tokenBalance?.numerator ?? JSBI.BigInt(0);

  const tokenIdx: 0 | 1 | undefined = useMemo(() => {
    if (vault && currency && vault.token1) {
      if (
        currency.wrapped.address.toLowerCase() ===
        vault.token1.address.toLowerCase()
      )
        return 1;
      return 0;
    }
    return;
  }, [currency, vault]);

  const { isLoading, data: maxAvailable } = useQuery({
    queryKey: ['ichi-vault-max-available-deposit', vault?.address],
    queryFn: async () => {
      if (!vault || !provider || tokenIdx === undefined) return null;
      const maxAvailable = await getMaxDepositAmount(
        tokenIdx,
        vault.address,
        provider,
        SupportedDex.Quickswap,
      );
      return maxAvailable;
    },
  });

  const balanceBN = useMemo(() => {
    if (isNativeToken) {
      return JSBI.add(ethBalanceBN, wethBalanceBN);
    }
    return tokenBalanceBN;
  }, [ethBalanceBN, isNativeToken, tokenBalanceBN, wethBalanceBN]);

  const maxAvailableBN = JSBI.BigInt(maxAvailable ?? '0');
  const availableAmount = JSBI.greaterThan(balanceBN, maxAvailableBN)
    ? maxAvailableBN
    : balanceBN;

  const amountBN = JSBI.BigInt(
    parseUnits(amount.toFixed(currency?.decimals), currency?.decimals),
  );

  const wrapAmount = useMemo(() => {
    if (isNativeToken) {
      if (JSBI.greaterThan(amountBN, wethBalanceBN))
        return JSBI.subtract(amountBN, wethBalanceBN);
      return;
    }
    return;
  }, [isNativeToken, amountBN, wethBalanceBN]);

  const isMorethanAvailable = JSBI.greaterThan(amountBN, availableAmount);

  return {
    isLoading,
    data: {
      tokenIdx,
      availableAmount,
      wrapAmount,
      isMorethanAvailable,
      isNativeToken,
    },
  };
};
