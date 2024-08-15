import axios from 'axios';
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/v3/addresses';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { useActiveWeb3React } from 'hooks';
const TEAM_FINANCE_BACKEND_URL =
  'https://team-finance-backend-dev-origdfl2wq-uc.a.run.app/api';
const API_KEY = process.env.TEAM_FINANCE_BACKEND_API_KEY ?? 'yolobolo';

export interface Event {
  chainId: string;
  createdAt: string;
  isNftMinted: boolean;
  isWithdrawn: boolean;
  liquidityContractAddress: string;
  liquidityPairAddress: string;
  liquidityPairReserve: string;
  liquidityTokenReserve: string;
  liquidityTotalSupply: string;
  lockAmount: string;
  lockContractAddress: string;
  lockDepositId: number;
  lockNftContractAddress: string;
  migratedLockDepositId: number;
  network: string;
  senderAddress: string;
  timeStamp: number;
  tokenAddress: string;
  tokenId: string;
  tokenTotalSupply: string;
  transactionAmount: string;
  transactionHash: string;
  transactionIndex: number;
  unlockTime: number;
  updatedAt: string;
  withdrawalAddress: string;
}

export interface Token {
  chainId: string;
  createdAt: string;
  isLiquidityToken: boolean;
  isNFT: boolean;
  liquidityLockedInPercent: number;
  liquidityLockedInUsd: number;
  network: string;
  tokenAddress: string;
  tokenCirculatingSupply: string;
  tokenDecimals: number;
  tokenId: string;
  tokenLocked: string;
  tokenName: string;
  tokenImage?: string;
  tokenSymbol: string;
  tokenTotalSupply: string;
  updatedAt: string;
  token0?: string;
  token1?: string;
}

export interface LiquidityContract {
  chainId: string;
  createdAt: string;
  isLiquidityToken: boolean;
  network: string;
  token0: string;
  token1: string;
  tokenAddress: string;
  tokenDecimals: number;
  tokenName: string;
  tokenSymbol: string;
  tokenTotalSupply: string;
  updatedAt: string;
}

export interface Pair {
  chainId: string;
  createdAt: string;
  isLiquidityToken: boolean;
  isNFT: boolean;
  liquidityLockedInPercent: number;
  liquidityLockedInUsd: number;
  network: string;
  tokenAddress: string;
  tokenCirculatingSupply: string;
  tokenDecimals: number;
  tokenId: string;
  tokenLocked: string;
  tokenName: string;
  tokenImage: string;
  tokenSymbol: string;
  tokenTotalSupply: string;
  updatedAt: string;
}

export interface LockInterface {
  event: Event;
  token: Token;
  liquidityContract?: LiquidityContract;
  pair?: Pair;
}

axios.defaults.baseURL = TEAM_FINANCE_BACKEND_URL;
axios.defaults.timeout = 120000;
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.common.Authorization = API_KEY;

const useUserLPLocks = (account?: string) => {
  const lastTx = useLastTransactionHash();

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['tf-lpLock', account],
    queryFn: async () => {
      if (!account) return [];
      try {
        const URL = `/app/allMylocks/${account}`;
        const response = await axios.get(URL);
        return response.data.data as LockInterface[];
      } catch (error) {
        return [];
      }
    },
    refetchInterval: 300000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setTimeout(() => {
      refetch();
    }, 30000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);

  return { data, loading, error };
};

export const useUserV2LiquidityLocks = (account?: string) => {
  const { chainId } = useActiveWeb3React();
  const { data, loading, error } = useUserLPLocks(account);
  const v2LpLocks = (data ?? [])
    .filter((item: LockInterface) => {
      return (
        Number(item.event.chainId) === chainId && !Number(item.event.tokenId)
      );
    })
    .filter(
      (item, ind, self) =>
        self.findIndex(
          (item1) =>
            item.event.lockContractAddress ===
              item1.event.lockContractAddress &&
            item.event.lockDepositId === item1.event.lockDepositId &&
            item.event.unlockTime === item1.event.unlockTime,
        ) === ind,
    );

  return { data: v2LpLocks, loading, error };
};

export const useUserV3LiquidityLocks = (account?: string) => {
  const { chainId } = useActiveWeb3React();
  const { data, loading, error } = useUserLPLocks(account);
  const v3LpLocks = (data ?? [])
    .filter((item: LockInterface) => {
      return (
        Number(item.event.chainId) === chainId &&
        item.liquidityContract?.tokenAddress ===
          NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
      );
    })
    .filter(
      (item, ind, self) =>
        self.findIndex(
          (item1) =>
            item.event.lockContractAddress ===
              item1.event.lockContractAddress &&
            item.event.lockDepositId === item1.event.lockDepositId &&
            item.event.unlockTime === item1.event.unlockTime,
        ) === ind,
    );

  return { data: v3LpLocks, loading, error };
};

export const updateUserLiquidityLock = async (
  lockContractAddress: string,
  lockDepositId: number,
) => {
  const URL = `/app/locks/${lockContractAddress}/${lockDepositId}`;
  return await axios.put(
    URL,
    {},
    {
      headers: {},
      params: {
        network: 'polygon',
        chainId: '0x89',
      },
    },
  );
};
