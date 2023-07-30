import React from 'react';
import {
  Result,
  useMultipleContractMultipleData,
  useSingleCallResult,
  useSingleContractMultipleData,
} from 'state/multicall/v3/hooks';
import { useEffect, useMemo } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { useActiveWeb3React } from 'hooks';
import {
  useMasterChefContracts,
  useV3NFTPositionManagerContract,
} from 'hooks/useContract';
import usePrevious, { usePreviousNonEmptyArray } from 'hooks/usePrevious';
import { useFarmingSubgraph } from 'hooks/useIncentiveSubgraph';
import { PositionPool } from 'models/interfaces';
import { ChainId } from '@uniswap/sdk';
import { getGammaPositions } from 'utils';
import { useQuery } from 'react-query';
import { GammaPair, GammaPairs } from 'constants/index';
import { formatUnits } from 'ethers/lib/utils';

interface UseV3PositionsResults {
  loading: boolean;
  positions: PositionPool[] | undefined;
}

function useV3PositionsFromTokenIds(
  tokenIds: BigNumber[] | undefined,
): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract();
  const inputs = useMemo(
    () =>
      tokenIds ? tokenIds.map((tokenId) => [BigNumber.from(tokenId)]) : [],
    [tokenIds],
  );
  const results = useSingleContractMultipleData(
    positionManager,
    'positions',
    inputs,
  );

  const loading = useMemo(() => results.some(({ loading }) => loading), [
    results,
  ]);
  const error = useMemo(() => results.some(({ error }) => error), [results]);

  const { account } = useActiveWeb3React();

  const prevAccount = usePrevious(account);

  const positions = useMemo(() => {
    if (!loading && !error && tokenIds) {
      return results.map((call, i) => {
        const tokenId = tokenIds[i];
        const result = call.result as Result;
        return {
          tokenId,
          fee: result.fee,
          feeGrowthInside0LastX128: result.feeGrowthInside0LastX128,
          feeGrowthInside1LastX128: result.feeGrowthInside1LastX128,
          liquidity: result.liquidity,
          nonce: result.nonce,
          operator: result.operator,
          tickLower: result.tickLower,
          tickUpper: result.tickUpper,
          token0: result.token0,
          token1: result.token1,
          tokensOwed0: result.tokensOwed0,
          tokensOwed1: result.tokensOwed1,
        };
      });
    }
    return undefined;
  }, [loading, error, results, tokenIds]);

  const prevPositions = usePreviousNonEmptyArray(positions || []);

  return useMemo(() => {
    if (prevAccount !== account)
      return {
        loading,
        positions: positions?.map((position, i) => ({
          ...position,
          tokenId: inputs[i][0],
        })),
      };

    if (!prevPositions && positions)
      return {
        loading,
        positions: positions?.map((position, i) => ({
          ...position,
          tokenId: inputs[i][0],
        })),
      };

    if (tokenIds && prevPositions && tokenIds.length !== prevPositions.length)
      return {
        loading: false,
        positions: [],
      };

    if (
      (!positions || positions.length === 0) &&
      prevPositions &&
      prevPositions.length !== 0
    )
      return {
        loading: false,
        positions: prevPositions.map((position, i) => ({
          ...position,
          tokenId: inputs[i][0],
        })),
      };

    return {
      loading,
      positions: positions?.map((position, i) => ({
        ...position,
        tokenId: inputs[i][0],
      })),
    };
  }, [
    prevAccount,
    account,
    loading,
    positions,
    prevPositions,
    tokenIds,
    inputs,
  ]);
}

interface UseV3PositionResults {
  loading: boolean;
  position: PositionPool | undefined;
}

export function useV3PositionFromTokenId(
  tokenId: BigNumber | undefined,
): UseV3PositionResults {
  const position = useV3PositionsFromTokenIds(tokenId ? [tokenId] : undefined);
  return {
    loading: position.loading,
    position: position.positions?.[0],
  };
}

export function useV3Positions(
  account: string | null | undefined,
): UseV3PositionsResults {
  const positionManager = useV3NFTPositionManagerContract();

  const {
    loading: balanceLoading,
    result: balanceResult,
  } = useSingleCallResult(positionManager, 'balanceOf', [account ?? undefined]);

  const {
    fetchPositionsOnFarmer: {
      positionsOnFarmer,
      positionsOnFarmerLoading,
      fetchPositionsOnFarmerFn,
    },
  } = useFarmingSubgraph();

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  useEffect(() => {
    if (account) {
      fetchPositionsOnFarmerFn(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests: any[] = [];
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [account, accountBalance]);

  const tokenIdResults = useSingleContractMultipleData(
    positionManager,
    'tokenOfOwnerByIndex',
    tokenIdsArgs,
  );
  const someTokenIdsLoading = useMemo(
    () => tokenIdResults.some(({ loading }) => loading),
    [tokenIdResults],
  );

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is Result => !!result)
        .map((result) => BigNumber.from(result[0]));
    }
    return [];
  }, [account, tokenIdResults]);

  // const prevTokenIds = usePreviousNonEmptyArray(tokenIds)

  // const _tokenIds = useMemo(() => {

  //     if (!prevTokenIds) return tokenIds

  //     if (tokenIds.length === 0 && prevTokenIds.length !== 0) return prevTokenIds

  //     return tokenIds

  // }, [tokenIds, account])

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(
    tokenIds,
  );

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

  const combinedPositions = useMemo(() => {
    if (positions && _positionsOnFarmer && _positionsOnOldFarmer) {
      return [
        ...positions,
        ..._positionsOnFarmer.map((position) => ({
          ...position,
          onFarming: true,
        })),
        ..._positionsOnOldFarmer.map((position) => ({
          ...position,
          oldFarming: true,
        })),
      ];
    }

    return undefined;
  }, [positions, _positionsOnFarmer, _positionsOnOldFarmer]);

  return {
    loading:
      someTokenIdsLoading ||
      balanceLoading ||
      positionsLoading ||
      _positionsOnFarmerLoading,
    positions: combinedPositions,
  };
}

export function useV3PositionsCount(
  account: string | null | undefined,
  hideClosePosition: boolean,
  hideFarmingPosition: boolean,
) {
  const positionManager = useV3NFTPositionManagerContract();

  const {
    loading: balanceLoading,
    result: balanceResult,
  } = useSingleCallResult(positionManager, 'balanceOf', [account ?? undefined]);

  const accountBalance = useMemo(() => {
    if (balanceResult && balanceResult.length > 0) {
      return balanceResult[0].toNumber();
    }
    return 0;
  }, [balanceResult]);

  const tokenIdsArgs = useMemo(() => {
    if (accountBalance && account) {
      const tokenRequests: any[] = [];
      for (let i = 0; i < accountBalance; i++) {
        tokenRequests.push([account, i]);
      }
      return tokenRequests;
    }
    return [];
  }, [account, accountBalance]);

  const tokenIdResults = useSingleContractMultipleData(
    positionManager,
    'tokenOfOwnerByIndex',
    tokenIdsArgs,
  );

  const tokenIds = useMemo(() => {
    if (account) {
      return tokenIdResults
        .map(({ result }) => result)
        .filter((result): result is Result => !!result)
        .map((result) => BigNumber.from(result[0]));
    }
    return [];
  }, [account, tokenIdResults]);

  const { positions, loading: positionsLoading } = useV3PositionsFromTokenIds(
    tokenIds,
  );

  const {
    fetchPositionsOnFarmer: {
      positionsOnFarmer,
      positionsOnFarmerLoading,
      fetchPositionsOnFarmerFn,
    },
  } = useFarmingSubgraph();

  useEffect(() => {
    if (account) {
      fetchPositionsOnFarmerFn(account);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const farmingPositionsCount = useMemo(() => {
    if (positionsOnFarmer && positionsOnFarmer.transferredPositionsIds) {
      return positionsOnFarmer.transferredPositionsIds.length;
    }

    return 0;
  }, [positionsOnFarmer]);

  const oldFarmingPositionsCount = useMemo(() => {
    if (positionsOnFarmer && positionsOnFarmer.oldTransferredPositionsIds) {
      return positionsOnFarmer.oldTransferredPositionsIds.length;
    }

    return 0;
  }, [positionsOnFarmer]);

  const positionCount = useMemo(() => {
    if (!positions) return 0;
    return positions.filter((position) =>
      hideClosePosition ? position.liquidity.gt('0') : true,
    ).length;
  }, [hideClosePosition, positions]);

  const totalCount =
    positionCount +
    (hideFarmingPosition
      ? 0
      : farmingPositionsCount + oldFarmingPositionsCount);

  const prevCount = usePrevious(totalCount);

  const count = totalCount > 0 ? totalCount : prevCount;

  return {
    loading: balanceLoading || positionsLoading || positionsOnFarmerLoading,
    count,
  };
}

export function useGammaPositionsCount(
  account: string | null | undefined,
  chainId: ChainId | undefined,
) {
  const fetchGammaPositions = async () => {
    if (!account || !chainId) return;
    const gammaPositions = await getGammaPositions(account, chainId);
    return gammaPositions;
  };

  const { isLoading: positionsLoading, data: gammaPositions } = useQuery(
    'fetchGammaPositions',
    fetchGammaPositions,
    {
      refetchInterval: 30000,
    },
  );

  const allGammaPairsToFarm = chainId
    ? ([] as GammaPair[]).concat(...Object.values(GammaPairs[chainId]))
    : [];
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

  const stakedLPs = allGammaPairsToFarm
    .map((item) => {
      const masterChefIndex = item.masterChefIndex ?? 0;
      const sItem =
        stakedAmounts && stakedAmounts.length > masterChefIndex
          ? stakedAmounts[masterChefIndex].find(
              (sAmount) => sAmount.pid === item.pid,
            )
          : undefined;
      return { ...item, stakedAmount: sItem ? Number(sItem.amount) : 0 };
    })
    .filter((item) => {
      return item.stakedAmount > 0;
    });

  const gammaPositionArray = useMemo(() => {
    if (gammaPositions && chainId) {
      return Object.keys(gammaPositions)
        .filter(
          (value) =>
            !!Object.values(GammaPairs[chainId]).find(
              (pairData) =>
                !!pairData.find(
                  (item) => item.address.toLowerCase() === value.toLowerCase(),
                ),
            ),
        )
        .filter(
          (pairAddress) =>
            !stakedLPs.find(
              (item) =>
                item.address.toLowerCase() === pairAddress.toLowerCase(),
            ),
        );
    }
    return [];
  }, [chainId, gammaPositions, stakedLPs]);

  const count = useMemo(() => {
    return gammaPositionArray.length + stakedLPs.length;
  }, [gammaPositionArray, stakedLPs]);

  return { loading: positionsLoading || stakedLoading, count };
}
