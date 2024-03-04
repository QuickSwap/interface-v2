import {
  useMultipleContractMultipleData,
  useMultipleContractSingleData,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import { useEffect, useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { useActiveWeb3React } from 'hooks';
import {
  useUNIV3NFTPositionManagerContract,
  useMasterChefContracts,
  useV3NFTPositionManagerContract,
  useDefiEdgeMiniChefContracts,
} from 'hooks/useContract';
import { usePositionsOnFarmer } from 'hooks/useIncentiveSubgraph';
import { PositionPool } from 'models/interfaces';
import { ChainId, JSBI } from '@uniswap/sdk';
import {
  getAllDefiedgeStrategies,
  getAllGammaPairs,
  getContract,
  getTokenFromAddress,
} from 'utils';
import { useQuery } from '@tanstack/react-query';
import { Interface, formatUnits } from 'ethers/lib/utils';
import UNIPILOT_VAULT_ABI from 'constants/abis/unipilot-vault.json';
import UNIPILOT_SINGLE_REWARD_ABI from 'constants/abis/unipilot-single-reward.json';
import UNIPILOT_DUAL_REWARD_ABI from 'constants/abis/unipilot-dual-reward.json';
import { getConfig } from 'config/index';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import DEFIEDGE_STRATEGY_ABI from 'constants/abis/defiedge-strategy.json';
import { useSteerStakedPools, useSteerVaults } from './useSteerData';
import { Token } from '@uniswap/sdk-core';
import { UnipilotVaults, subgraphNotReadyChains } from 'constants/index';
import { useUnipilotFarms } from './useUnipilotFarms';
import { useTokenBalances } from 'state/wallet/v3/hooks';
import {
  useICHIVaultUserBalances,
  useICHIVaults,
  useICHIVaultsUserAmounts,
} from 'hooks/useICHIData';
import { useSelectedTokenList } from 'state/lists/hooks';
import { toV3Token } from 'constants/v3/addresses';
import { useLastTransactionHash } from 'state/transactions/hooks';

interface UseV3PositionsResults {
  loading: boolean;
  positions: PositionPool[] | undefined;
  count?: number;
}

export function useV3PositionsFromTokenIds(
  tokenIds: BigNumber[] | undefined,
  isUni?: boolean,
): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract();
  const uniV3PositionManager = useUNIV3NFTPositionManagerContract();

  const inputs = useMemo(
    () =>
      tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : [],
    [tokenIds],
  );

  const results = useSingleContractMultipleData(
    isUni ? uniV3PositionManager : positionManager,
    'positions',
    inputs,
  );

  const loading = useMemo(() => results.some(({ loading }) => loading), [
    results,
  ]);
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i];
        const result = call.result;
        return {
          tokenId,
          fee: result?.fee,
          feeGrowthInside0LastX128: result?.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result?.feeGrowthInside1LastX128,
          liquidity: result?.liquidity,
          nonce: result?.nonce,
          operator: result?.operator,
          tickLower: result?.tickLower,
          tickUpper: result?.tickUpper,
          token0: result?.token0,
          token1: result?.token1,
          tokensOwed0: result?.tokensOwed0,
          tokensOwed1: result?.tokensOwed1,
          isUni,
        };
      });
    }
    return undefined;
  }, [loading, error, tokenIds, results, isUni]);

  return { loading, positions };
}

interface UseV3PositionResults {
  loading: boolean;
  position: PositionPool | undefined;
}

export function useV3PositionFromTokenId(
  tokenId: BigNumber | undefined,
  isUni?: boolean,
): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(
    tokenId ? [tokenId] : undefined,
    isUni,
  );
  return {
    loading: position.loading,
    position: position.positions?.[0],
  };
}

export function useV3Positions(
  account: string | null | undefined,
  hideClosePosition?: boolean,
  hideFarmingPosition?: boolean,
): UseV3PositionsResults {
  const { chainId } = useActiveWeb3React();
  const positionManager = useV3NFTPositionManagerContract();
  const uniV3PositionManager = useUNIV3NFTPositionManagerContract();

  async function fetchUserPositions(isUni?: boolean) {
    if (!account) return null;
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_LEADERBOARD_APP_URL
        }/utils/user-positions?chainId=${chainId}&address=${account}${
          isUni ? `&isUni=true` : ''
        }`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const positions = data?.data?.data ?? null;

      return positions;
    } catch (err) {
      return null;
    }
  }

  async function fetchUserPositionIDsContract(isUni?: boolean) {
    const contract = isUni ? uniV3PositionManager : positionManager;
    if (!account || !contract) return null;
    try {
      const res = await contract.balanceOf(account);
      const accountBalance = Number(res);
      const positionIDs = [];
      for (let i = 0; i < accountBalance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        positionIDs.push(tokenId);
      }
      return positionIDs;
    } catch (err) {
      return null;
    }
  }

  const {
    data: algebraPositionIDs,
    isLoading: algebraIDsLoading,
    refetch: refetchAlgebraIDs,
  } = useQuery({
    queryKey: [
      'user-algebra-v3-positions',
      account,
      chainId,
      !!positionManager,
      subgraphNotReadyChains.join('_'),
    ],
    queryFn: async () => {
      let positionIDs: BigNumber[] = [];
      if (positionManager) {
        if (subgraphNotReadyChains.includes(chainId)) {
          const ids = await fetchUserPositionIDsContract();
          if (ids) {
            positionIDs = ids;
          }
        } else {
          const positionsFromSubgraph = await fetchUserPositions();
          if (!positionsFromSubgraph || !positionsFromSubgraph.length) {
            const ids = await fetchUserPositionIDsContract();
            if (ids) {
              positionIDs = ids;
            }
          } else {
            positionIDs = positionsFromSubgraph
              .map((item: any) =>
                item?.id ? BigNumber.from(item?.id) : undefined,
              )
              .filter((id: any) => !!id);
          }
        }
      }
      return positionIDs ?? [];
    },
    refetchInterval: 1000 * 60 * 5,
  });

  const {
    data: univ3PositionIDs,
    isLoading: univ3IDsLoading,
    refetch: refetchUniV3IDs,
  } = useQuery({
    queryKey: [
      'user-uni-v3-positions',
      account,
      chainId,
      !!uniV3PositionManager,
      subgraphNotReadyChains.join('_'),
    ],
    queryFn: async () => {
      let positionIDs: BigNumber[] = [];
      if (uniV3PositionManager) {
        if (subgraphNotReadyChains.includes(chainId)) {
          const ids = await fetchUserPositionIDsContract(true);
          if (ids) {
            positionIDs = ids;
          }
        } else {
          const uniV3PositionsFromSubgraph = await fetchUserPositions(true);
          if (!uniV3PositionsFromSubgraph) {
            const ids = await fetchUserPositionIDsContract(true);
            if (ids) {
              positionIDs = ids;
            }
          } else {
            positionIDs = uniV3PositionsFromSubgraph
              .map((item: any) =>
                item?.id ? BigNumber.from(item?.id) : undefined,
              )
              .filter((id: any) => !!id);
          }
        }
      }
      return positionIDs ?? [];
    },
    refetchInterval: 1000 * 60 * 5,
  });

  const lastTx = useLastTransactionHash();

  useEffect(() => {
    setTimeout(() => {
      refetchAlgebraIDs();
      refetchUniV3IDs();
    }, 30000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTx]);

  const {
    positions: algebraPositions,
    loading: algebraPositionsLoading,
  } = useV3PositionsFromTokenIds(algebraPositionIDs);

  const {
    positions: uniV3Positions,
    loading: uniV3PositionsLoading,
  } = useV3PositionsFromTokenIds(univ3PositionIDs, true);

  const { data: positionsOnFarmer } = usePositionsOnFarmer(account);

  const transferredTokenIds = useMemo(() => {
    if (positionsOnFarmer && positionsOnFarmer.transferredPositionsIds) {
      return positionsOnFarmer.transferredPositionsIds;
    }

    return [];
  }, [positionsOnFarmer]);

  const {
    positions: _positionsOnFarmer,
    loading: _positionsOnFarmerLoading,
  } = useV3PositionsFromTokenIds(
    transferredTokenIds.map((id) => BigNumber.from(id)),
  );

  const oldTransferredTokenIds = useMemo(() => {
    if (positionsOnFarmer && positionsOnFarmer.oldTransferredPositionsIds) {
      return positionsOnFarmer.oldTransferredPositionsIds;
    }

    return [];
  }, [positionsOnFarmer]);

  const {
    positions: _positionsOnOldFarmer,
    loading: _positionsOnOldFarmerLoading,
  } = useV3PositionsFromTokenIds(
    oldTransferredTokenIds.map((id) => BigNumber.from(id)),
  );

  const combinedPositions = [
    ...(algebraPositions ?? [])
      .concat(uniV3Positions ?? [])
      .filter((position: any) =>
        hideClosePosition ? position.liquidity.gt('0') : true,
      ),
    ...(_positionsOnFarmer ?? []).map((position) => ({
      ...position,
      onFarming: true,
    })),
    ...(_positionsOnOldFarmer ?? []).map((position) => ({
      ...position,
      oldFarming: true,
    })),
  ];

  const count =
    (algebraPositions ?? [])
      .concat(uniV3Positions ?? [])
      .filter((position: any) =>
        hideClosePosition ? position.liquidity.gt('0') : true,
      ).length +
    (hideFarmingPosition
      ? 0
      : transferredTokenIds.length + oldTransferredTokenIds.length);

  return {
    loading:
      algebraPositionsLoading ||
      uniV3PositionsLoading ||
      algebraIDsLoading ||
      univ3IDsLoading ||
      _positionsOnFarmerLoading,
    positions: combinedPositions,
    count,
  };
}

export function useGammaPositionsCount(
  account: string | null | undefined,
  chainId: ChainId | undefined,
) {
  const allGammaPairsToFarm = getAllGammaPairs(chainId);
  const masterChefContracts = useMasterChefContracts();
  const stakedAmountData = useMultipleContractMultipleData(
    account ? masterChefContracts : [],
    'userInfo',
    account
      ? masterChefContracts.map((_, ind) =>
          allGammaPairsToFarm
            .filter((pair) => (pair.masterChefIndex ?? 0) === ind)
            .map((pair) => [pair.pid, account]),
        )
      : [],
  );

  const stakedAmounts = stakedAmountData.map((callStates, ind) => {
    const gammaPairsFiltered = allGammaPairsToFarm.filter(
      (pair) => (pair.masterChefIndex ?? 0) === ind,
    );
    return callStates.map((callData, index) => {
      const amount =
        !callData.loading && callData.result && callData.result.length > 0
          ? formatUnits(callData.result[0], 18)
          : '0';
      const gPair =
        gammaPairsFiltered.length > index
          ? gammaPairsFiltered[index]
          : undefined;
      return {
        amount,
        pid: gPair?.pid,
        masterChefIndex: ind,
      };
    });
  });

  const stakedLoading = !!stakedAmountData.find(
    (callStates) => !!callStates.find((callData) => callData.loading),
  );

  const stakedLPs = allGammaPairsToFarm.map((item) => {
    const masterChefIndex = item.masterChefIndex ?? 0;
    const sItem =
      stakedAmounts && stakedAmounts.length > masterChefIndex
        ? stakedAmounts[masterChefIndex].find(
            (sAmount) => sAmount.pid === item.pid,
          )
        : undefined;
    return { ...item, stakedAmount: sItem ? Number(sItem.amount) : 0 };
  });

  const gammaPairAddresses = allGammaPairsToFarm.map((pair) => pair.address);
  const lpBalancesData = useMultipleContractSingleData(
    gammaPairAddresses,
    new Interface(GammaPairABI),
    'balanceOf',
    [account ?? undefined],
  );

  const lpBalances = lpBalancesData.map((callData, ind) => {
    const amount =
      !callData.loading && callData.result && callData.result.length > 0
        ? Number(formatUnits(callData.result[0], 18))
        : 0;
    return { address: gammaPairAddresses[ind], amount };
  });

  const lpBalancesLoading = !!lpBalancesData.find(
    (callState) => !!callState.loading,
  );

  const pairWithBalances = gammaPairAddresses.map((address) => {
    const stakedAmount =
      stakedLPs.find((lp) => lp.address.toLowerCase() === address.toLowerCase())
        ?.stakedAmount ?? 0;
    const lpBalance =
      lpBalances.find(
        (lp) => lp.address.toLowerCase() === address.toLowerCase(),
      )?.amount ?? 0;
    return stakedAmount + lpBalance;
  });
  const count = useMemo(() => {
    return pairWithBalances.filter((balance) => balance > 0).length;
  }, [pairWithBalances]);

  return { loading: lpBalancesLoading || stakedLoading, count };
}

export function useUnipilotPositionsCount(
  account: string | null | undefined,
  chainId: ChainId | undefined,
) {
  const { library } = useActiveWeb3React();
  const vaultIds = chainId ? UnipilotVaults[chainId] ?? [] : [];
  const config = getConfig(chainId);
  const unipilotAvailable = config['unipilot']['available'];
  const vaultBalanceCalls = useMultipleContractSingleData(
    vaultIds,
    new Interface(UNIPILOT_VAULT_ABI),
    'balanceOf',
    [account ?? undefined],
  );
  const vaultBalanceLoading = vaultBalanceCalls.find((call) => call.loading);
  const { loading: loadingFarms, data: uniPilotFarmsData } = useUnipilotFarms(
    chainId,
  );
  const uniPilotFarms = uniPilotFarmsData ?? [];
  const fetchUnipilotPositionCounts = async () => {
    if (!account || !chainId || !unipilotAvailable) return 0;
    const vaultCounts = await Promise.all(
      vaultIds.map(async (vault, ind) => {
        const unipilotFarm = uniPilotFarms.find(
          (farm: any) =>
            farm.stakingAddress.toLowerCase() === vault.toLowerCase(),
        );
        const vaultBalanceCallData = vaultBalanceCalls[ind];
        const lpBalance =
          !vaultBalanceCallData.loading && vaultBalanceCallData.result
            ? JSBI.BigInt(vaultBalanceCallData.result)
            : JSBI.BigInt(0);
        if (unipilotFarm && library) {
          const farmContract = getContract(
            unipilotFarm.id,
            unipilotFarm.isDualReward
              ? UNIPILOT_DUAL_REWARD_ABI
              : UNIPILOT_SINGLE_REWARD_ABI,
            library,
          );
          const stakedAmount = await farmContract.balanceOf(account ?? '');
          return JSBI.add(JSBI.BigInt(stakedAmount), lpBalance);
        }
        return lpBalance;
      }),
    );

    return vaultCounts.filter((count) =>
      JSBI.greaterThan(count, JSBI.BigInt(0)),
    ).length;
  };

  const { isLoading: positionCountLoading, data } = useQuery({
    queryKey: [
      'fetchUnipilotPositionsCount',
      account,
      chainId,
      uniPilotFarms.map((farm: any) => farm.id).join('_'),
    ],
    queryFn: fetchUnipilotPositionCounts,
    refetchInterval: 300000,
  });

  return {
    loading: vaultBalanceLoading || loadingFarms || positionCountLoading,
    count: data ?? 0,
  };
}

export interface UnipilotPosition {
  id: string;
  balance: JSBI;
  lpBalance: JSBI;
  strategyId: number;
  token0: Token | undefined;
  token1: Token | undefined;
  farming: boolean;
  token0Balance?: JSBI;
  token1Balance?: JSBI;
}

export function useUnipilotPositions(
  account: string | null | undefined,
  chainId: ChainId | undefined,
): { loading: boolean; unipilotPositions: UnipilotPosition[] } {
  const { library } = useActiveWeb3React();
  const config = getConfig(chainId);
  const unipilotAvailable = config['unipilot']['available'];
  const vaultIds = chainId ? UnipilotVaults[chainId] ?? [] : [];
  const { loading: loadingFarms, data: uniPilotFarmsData } = useUnipilotFarms(
    chainId,
  );
  const uniPilotFarms = uniPilotFarmsData ?? [];
  const vaultBalanceCalls = useMultipleContractSingleData(
    vaultIds,
    new Interface(UNIPILOT_VAULT_ABI),
    'balanceOf',
    [account ?? undefined],
  );

  const fetchUnipilotVaultsWithBalance = async () => {
    if (!account || !chainId || !unipilotAvailable) return null;
    const unipilotVaultsWithBalance = await Promise.all(
      vaultIds.map(async (vault, ind) => {
        const unipilotFarm = uniPilotFarms.find(
          (farm: any) =>
            farm.stakingAddress.toLowerCase() === vault.toLowerCase(),
        );
        const vaultBalanceCallData = vaultBalanceCalls[ind];
        const lpBalance =
          !vaultBalanceCallData.loading && vaultBalanceCallData.result
            ? JSBI.BigInt(vaultBalanceCallData.result)
            : JSBI.BigInt(0);
        if (unipilotFarm && library) {
          const farmContract = getContract(
            unipilotFarm.id,
            unipilotFarm.isDualReward
              ? UNIPILOT_DUAL_REWARD_ABI
              : UNIPILOT_SINGLE_REWARD_ABI,
            library,
          );
          const stakedAmount = await farmContract.balanceOf(account ?? '');
          if (Number(stakedAmount) > 0) {
            return {
              id: vault,
              balance: JSBI.add(JSBI.BigInt(stakedAmount), lpBalance),
              lpBalance,
              farming: true,
            };
          }
          return {
            id: vault,
            balance: lpBalance,
            lpBalance,
            farming: false,
          };
        }
        return { id: vault, balance: lpBalance, lpBalance, farming: false };
      }),
    );

    return unipilotVaultsWithBalance.filter((position) =>
      JSBI.greaterThan(position.balance, JSBI.BigInt(0)),
    );
  };

  const { isLoading, data: unipilotVaultsWithBalance } = useQuery({
    queryKey: [
      'fetchUnipilotVaultsWithBalance',
      account,
      chainId,
      uniPilotFarms.map((farm: any) => farm.id).join('_'),
    ],
    queryFn: fetchUnipilotVaultsWithBalance,
    refetchInterval: 300000,
  });

  const vaultIdsWithBalance =
    unipilotVaultsWithBalance?.map((vault) => vault.id) ?? [];

  const vaultSymbolCalls = useMultipleContractSingleData(
    vaultIdsWithBalance,
    new Interface(UNIPILOT_VAULT_ABI),
    'symbol',
  );

  const vaultInfoCalls = useMultipleContractSingleData(
    vaultIdsWithBalance,
    new Interface(UNIPILOT_VAULT_ABI),
    'getVaultInfo',
  );

  const loading =
    loadingFarms ||
    isLoading ||
    !!vaultSymbolCalls.find((call) => call.loading) ||
    !!vaultInfoCalls.find((call) => call.loading);

  const tokenMap = useSelectedTokenList();

  const unipilotPositions = useMemo(() => {
    if (!unipilotVaultsWithBalance) return [];
    return unipilotVaultsWithBalance.map((vault, ind) => {
      const vaultSymbolCall = vaultSymbolCalls[ind];
      const vaultInfoCall = vaultInfoCalls[ind];
      const vaultSymbol =
        !vaultSymbolCall.loading && vaultSymbolCall.result
          ? vaultSymbolCall.result[0]
          : undefined;
      const vaultInfoResult =
        !vaultInfoCall.loading &&
        vaultInfoCall.result &&
        vaultInfoCall.result.length > 0
          ? vaultInfoCall.result
          : undefined;
      const token0Id = vaultInfoResult ? vaultInfoResult[0] : undefined;
      const token1Id = vaultInfoResult ? vaultInfoResult[1] : undefined;
      const token0 =
        token0Id && chainId
          ? getTokenFromAddress(token0Id, chainId, tokenMap, [])
          : undefined;
      const token1 =
        token1Id && chainId
          ? getTokenFromAddress(token1Id, chainId, tokenMap, [])
          : undefined;
      const vaultSymbolData = vaultSymbol ? vaultSymbol.split('-') : [];
      const strategyId = Number(vaultSymbolData[vaultSymbolData.length - 1]);
      return {
        ...vault,
        strategyId,
        token0: token0 ? toV3Token(token0) : undefined,
        token1: token1 ? toV3Token(token1) : undefined,
      };
    });
  }, [
    chainId,
    tokenMap,
    unipilotVaultsWithBalance,
    vaultInfoCalls,
    vaultSymbolCalls,
  ]);

  return {
    loading,
    unipilotPositions,
  };
}

export function useDefiedgePositions(
  account: string | null | undefined,
  chainId: ChainId | undefined,
) {
  const allDefidegeStrategies = getAllDefiedgeStrategies(chainId);

  const lpBalancesData = useMultipleContractSingleData(
    allDefidegeStrategies.map((strategy) => strategy.id),
    new Interface(DEFIEDGE_STRATEGY_ABI),
    'balanceOf',
    [account ?? undefined],
  );

  const miniChefAddresses = allDefidegeStrategies
    .filter((strategy) => !!strategy.miniChefAddress)
    .map((strategy) => (strategy.miniChefAddress ?? '').toLowerCase())
    .filter((address, ind, self) => self.indexOf(address) === ind);
  const miniChefContracts = useDefiEdgeMiniChefContracts(miniChefAddresses);

  const stakedAmountData = useMultipleContractMultipleData(
    account ? miniChefContracts : [],
    'userInfo',
    account
      ? miniChefAddresses.map((address) =>
          allDefidegeStrategies
            .filter(
              (item) =>
                (item.miniChefAddress ?? '').toLowerCase() ===
                address.toLowerCase(),
            )
            .map((item) => [item.pid, account]),
        )
      : [],
  );

  const stakedAmounts = miniChefAddresses
    .map((address, ind) => {
      const filteredStrategies = allDefidegeStrategies.filter(
        (pair) =>
          pair.miniChefAddress &&
          pair.miniChefAddress.toLowerCase() === address.toLowerCase(),
      );
      const callStates = stakedAmountData[ind];
      return callStates.map((callData, index) => {
        const amount =
          !callData.loading && callData.result && callData.result.length > 0
            ? Number(formatUnits(callData.result[0], 18))
            : 0;
        const strategy =
          filteredStrategies.length > index
            ? filteredStrategies[index]
            : undefined;
        return {
          amount,
          id: strategy?.id,
        };
      });
    })
    .flat();

  const lpBalances = lpBalancesData.map((callData) => {
    const amount =
      !callData.loading && callData.result && callData.result.length > 0
        ? Number(formatUnits(callData.result[0], 18))
        : 0;
    return amount;
  });

  const lpBalancesLoading = !!lpBalancesData.find(
    (callState) => !!callState.loading,
  );

  const positions = allDefidegeStrategies
    .map((strategy, i) => {
      const lpAmount = lpBalances[i];
      const stakedAmount = stakedAmounts.find(
        (item) =>
          item.id && item.id?.toLowerCase() === strategy.id.toLowerCase(),
      )?.amount;

      return {
        ...strategy,
        share: (stakedAmount ?? 0) + lpAmount,
        lpAmount,
      };
    })
    .filter((strategy) => strategy.share > 0);

  return { loading: lpBalancesLoading, count: positions.length, positions };
}

export const useV3SteerPositionsCount = () => {
  const { chainId, account } = useActiveWeb3React();
  const { loading, data: vaults } = useSteerVaults(chainId);
  const { loading: loadingFarms, data: steerFarms } = useSteerStakedPools(
    chainId,
    account,
  );
  const vaultTokens = vaults.map(
    (item) => new Token(chainId, item.address, item.vaultDecimals),
  );
  const vaultBalances = useTokenBalances(account, vaultTokens);
  const positions = vaults.filter((vault) => {
    const vaultBalanceItems = Object.values(vaultBalances);
    const vaultBalance = vaultBalanceItems.find(
      (item) =>
        item &&
        vault &&
        vault.address &&
        item.currency.address.toLowerCase() === vault.address.toLowerCase(),
    );
    const steerFarm = steerFarms.find(
      (farm: any) =>
        farm.stakingToken.toLowerCase() === vault.address.toLowerCase(),
    );
    return (
      Number(vaultBalance?.toExact() ?? 0) + (steerFarm?.stakedAmount ?? 0) > 0
    );
  });
  return { loading: loading || loadingFarms, count: positions.length };
};

export const useV3SteerPositions = () => {
  const { chainId, account } = useActiveWeb3React();
  const { data: vaults } = useSteerVaults(chainId);
  const { data: steerFarms } = useSteerStakedPools(chainId, account);
  const vaultTokens = vaults.map(
    (item) => new Token(chainId, item.address, item.vaultDecimals),
  );
  const vaultBalances = useTokenBalances(account, vaultTokens);
  return vaults.filter((vault) => {
    const vaultBalanceItems = Object.values(vaultBalances);
    const vaultBalance = vaultBalanceItems.find(
      (item) =>
        item &&
        vault &&
        vault.address &&
        item.currency.address.toLowerCase() === vault.address.toLowerCase(),
    );
    const steerFarm = steerFarms.find(
      (farm: any) =>
        farm.stakingToken.toLowerCase() === vault.address.toLowerCase(),
    );
    return (
      Number(vaultBalance?.toExact() ?? 0) + (steerFarm?.stakedAmount ?? 0) > 0
    );
  });
};

export const useICHIPositionsCount = () => {
  const { loading: loadingVaults, data: vaults } = useICHIVaults();
  const {
    isLoading: loadingBalances,
    data: vaultBalances,
  } = useICHIVaultUserBalances(vaults);
  const count = vaultBalances
    ? vaultBalances.filter(({ balance }) => balance > 0).length
    : 0;
  return { loading: loadingVaults || loadingBalances, count };
};

export const useICHIPositions = () => {
  const { loading: loadingVaults, data: vaults } = useICHIVaults();
  const {
    isLoading: loadingBalances,
    data: vaultBalances,
  } = useICHIVaultUserBalances(vaults);
  const {
    isLoading: loadingUserAmounts,
    data: userAmounts,
  } = useICHIVaultsUserAmounts(vaults);
  const positions = vaults
    .map((vault) => {
      const balanceItem = vaultBalances?.find(
        (item) => item.address.toLowerCase() === vault.address.toLowerCase(),
      );
      const userAmount = userAmounts?.find(
        (item) => item.address.toLowerCase() === vault.address.toLowerCase(),
      )?.amounts;
      return {
        ...vault,
        balance: balanceItem?.balance,
        balanceBN: balanceItem?.balanceBN,
        token0Balance: userAmount
          ? userAmount[0]
            ? Number(userAmount[0])
            : userAmount.amount0
            ? Number(userAmount.amount0)
            : 0
          : 0,
        token1Balance: userAmount
          ? userAmount[1]
            ? Number(userAmount[1])
            : userAmount.amount1
            ? Number(userAmount.amount1)
            : 0
          : 0,
      };
    }, [])
    .filter((item) => item.balance && item.balance > 0);

  return {
    loading: loadingVaults || loadingBalances || loadingUserAmounts,
    positions,
  };
};
