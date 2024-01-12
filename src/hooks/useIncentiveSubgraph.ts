import React from 'react';
import { useActiveWeb3React } from 'hooks';
import { Contract } from 'ethers';
import NON_FUN_POS_MAN from 'abis/non-fun-pos-man.json';
import FARMING_CENTER_ABI from 'abis/farming-center.json';
import FINITE_FARMING_ABI from 'abis/finite-farming.json';
import {
  FARMING_CENTER,
  FINITE_FARMING,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from '../constants/v3/addresses';
import { formatUnits } from '@ethersproject/units';
import {
  FormattedEternalFarming,
  PoolChartSubgraph,
  Position,
  Aprs,
} from '../models/interfaces';
import {
  fetchEternalFarmAPR,
  fetchEternalFarmTVL,
  fetchPoolsAPR,
} from 'utils/api';
import { useSelectedTokenList } from 'state/lists/hooks';
import { getTokenFromAddress } from 'utils';
import { ChainId } from '@uniswap/sdk';
import { formatTokenSymbol } from 'utils/v3-graph';
import { useQuery } from '@tanstack/react-query';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { getConfig } from 'config/index';

async function fetchToken(tokenId: string, farming = false, chainId: ChainId) {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/token-details/${tokenId}?chainId=${chainId}&farming=${farming}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    return data && data.data && data.data.token ? data.data.token : undefined;
  } catch (err) {
    return;
  }
}

async function fetchPool(poolId: string, chainId: ChainId) {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/pool-details/${poolId}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();

    const pool =
      data && data.data && data.data.pool ? data.data.pool : undefined;

    if (!pool) return;

    return {
      ...pool,
      token0: {
        ...pool.token0,
        symbol: formatTokenSymbol(pool.token0.id, pool.token0.symbol),
      },
      token1: {
        ...pool.token1,
        symbol: formatTokenSymbol(pool.token1.id, pool.token1.symbol),
      },
    };
  } catch (err) {
    return;
  }
}

async function fetchLimit(limitFarmingId: string, chainId: ChainId) {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/limit-farming/${limitFarmingId}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    return data && data.data && data.data.limitFarm
      ? data.data.limitFarm
      : undefined;
  } catch (err) {
    return;
  }
}

async function fetchEternalFarming(farmId: string, chainId: ChainId) {
  try {
    const res = await fetch(
      `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/eternal-farming/${farmId}?chainId=${chainId}`,
    );
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    return data && data.data && data.data.eternalFarm
      ? data.data.eternalFarm
      : undefined;
  } catch (err) {
    return;
  }
}

export function useFarmRewards() {
  const { chainId, account } = useActiveWeb3React();

  async function fetchRewards() {
    if (!account || !chainId) return;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/farm-rewards/${account}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const rewards =
        data && data.data && data.data.rewards ? data.data.rewards : [];

      const newRewards: any[] = [];

      for (const reward of rewards) {
        const rewardToken = await fetchToken(
          reward.rewardAddress,
          true,
          chainId,
        );

        const rewardAmount =
          +reward.amount > 0
            ? (
                +reward.amount /
                Math.pow(10, rewardToken ? +rewardToken.decimals : 0)
              ).toFixed(rewardToken ? +rewardToken.decimals : 0)
            : 0;

        const newReward = {
          ...reward,
          amount: rewardAmount,
          trueAmount: +reward.amount,
          symbol: rewardToken?.symbol,
          name: rewardToken?.name,
        };

        newRewards.push(newReward);
      }

      return newRewards;
    } catch (err) {
      return null;
    }
  }

  const lastTxHash = useLastTransactionHash();
  const { isLoading, data } = useQuery({
    queryKey: ['v3FarmRewards', chainId, lastTxHash, account],
    queryFn: fetchRewards,
  });

  return { isLoading, data };
}

export function useTransferredPositions() {
  const { chainId, account, provider } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const lastTxHash = useLastTransactionHash();
  async function fetchTransferredPositions() {
    if (!chainId || !account || !provider) {
      return [];
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/transferred-positions/${account}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      const positionsTransferred =
        data && data.data && data.data.positions ? data.data.positions : [];

      if (positionsTransferred.length === 0) {
        return [];
      }

      const _positions: any[] = [];

      for (const position of positionsTransferred) {
        const nftContract = new Contract(
          NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId],
          NON_FUN_POS_MAN,
          provider.getSigner(),
        );

        const {
          tickLower,
          tickUpper,
          liquidity,
          token0,
          token1,
        } = await nftContract.positions(+position.id);

        let _position = {
          ...position,
          tickLower,
          tickUpper,
          liquidity,
          token0,
          token1,
        };

        if (
          !position.limitFarming &&
          !position.eternalFarming &&
          typeof position.pool === 'string'
        ) {
          const _pool = await fetchPool(position.pool, chainId);
          if (_pool) {
            const token0 = getTokenFromAddress(
              _pool.token0.id,
              chainId,
              tokenMap,
              [],
            );
            const token1 = getTokenFromAddress(
              _pool.token1.id,
              chainId,
              tokenMap,
              [],
            );
            const newPool = {
              ..._pool,
              token0: token0 ?? _pool.token0,
              token1: token1 ?? _pool.token1,
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            _position = { ..._position, pool: newPool };
          }
        }

        if (position.limitFarming) {
          const finiteFarmingContract = new Contract(
            FINITE_FARMING[chainId],
            FINITE_FARMING_ABI,
            provider.getSigner(),
          );

          const {
            rewardToken,
            bonusRewardToken,
            pool,
            startTime,
            endTime,
            createdAtTimestamp,
            multiplierToken,
            tokenAmountForTier1,
            tokenAmountForTier2,
            tokenAmountForTier3,
            tier1Multiplier,
            tier2Multiplier,
            tier3Multiplier,
          } = await fetchLimit(position.limitFarming, chainId);

          const rewardInfo = await finiteFarmingContract.callStatic.getRewardInfo(
            [rewardToken, bonusRewardToken, pool, +startTime, +endTime],
            +position.id,
          );

          const _rewardToken = getTokenFromAddress(
            rewardToken,
            chainId,
            tokenMap,
            [],
          );
          const _bonusRewardToken = getTokenFromAddress(
            bonusRewardToken,
            chainId,
            tokenMap,
            [],
          );
          const _multiplierToken = getTokenFromAddress(
            multiplierToken,
            chainId,
            tokenMap,
            [],
          );
          const _pool = await fetchPool(pool, chainId);

          const token0 = getTokenFromAddress(
            _pool.token0.id,
            chainId,
            tokenMap,
            [],
          );
          const token1 = getTokenFromAddress(
            _pool.token1.id,
            chainId,
            tokenMap,
            [],
          );
          const newPool = {
            ..._pool,
            token0: token0 ?? _pool.token0,
            token1: token1 ?? _pool.token1,
          };

          _position = {
            ..._position,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            pool: newPool,
            limitRewardToken: _rewardToken,
            limitBonusRewardToken: _bonusRewardToken,
            limitStartTime: +startTime,
            limitEndTime: +endTime,
            started: +startTime * 1000 < Date.now(),
            ended: +endTime * 1000 < Date.now(),
            createdAtTimestamp: +createdAtTimestamp,
            limitEarned:
              rewardInfo[0] && _rewardToken
                ? formatUnits(rewardInfo[0], _rewardToken.decimals)
                : 0,
            limitBonusEarned:
              rewardInfo[1] && _bonusRewardToken
                ? formatUnits(rewardInfo[1], _bonusRewardToken.decimals)
                : 0,
            multiplierToken: _multiplierToken,
            tokenAmountForTier1,
            tokenAmountForTier2,
            tokenAmountForTier3,
            tier1Multiplier,
            tier2Multiplier,
            tier3Multiplier,
          };
        } else {
          const res = await fetch(
            `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/limit-farms-pool/${position.pool}?chainId=${chainId}`,
          );
          if (res.ok) {
            const data = await res.json();
            const limitFarmings =
              data && data.data && data.data.limitFarms
                ? data.data.limitFarms
                : [];

            if (
              limitFarmings.filter(
                (farm: any) => Math.round(Date.now() / 1000) < farm.startTime,
              ).length !== 0
            ) {
              _position = {
                ..._position,
                limitAvailable: true,
              };
            }
          }
        }

        if (position.eternalFarming) {
          const {
            id,
            rewardToken,
            bonusRewardToken,
            pool,
            startTime,
            endTime,
            multiplierToken,
            tier1Multiplier,
            tier2Multiplier,
            tier3Multiplier,
            tokenAmountForTier1,
            tokenAmountForTier2,
            tokenAmountForTier3,
            isDetached,
          } = await fetchEternalFarming(position.eternalFarming, chainId);

          const farmingCenterContract = new Contract(
            FARMING_CENTER[chainId],
            FARMING_CENTER_ABI,
            provider.getSigner(),
          );

          const _rewardToken = getTokenFromAddress(
            rewardToken,
            chainId,
            tokenMap,
            [],
          );
          const _bonusRewardToken = getTokenFromAddress(
            bonusRewardToken,
            chainId,
            tokenMap,
            [],
          );
          const _pool = await fetchPool(pool, chainId);

          const token0 = getTokenFromAddress(
            _pool.token0.id,
            chainId,
            tokenMap,
            [],
          );
          const token1 = getTokenFromAddress(
            _pool.token1.id,
            chainId,
            tokenMap,
            [],
          );
          const newPool = {
            ..._pool,
            token0: token0 ?? _pool.token0,
            token1: token1 ?? _pool.token1,
          };
          const _multiplierToken = getTokenFromAddress(
            multiplierToken,
            chainId,
            tokenMap,
            [],
          );

          let rewardRes: any;
          try {
            rewardRes = await farmingCenterContract.callStatic.collectRewards(
              [rewardToken, bonusRewardToken, pool, startTime, endTime],
              +position.id,
              { from: account },
            );
          } catch (e) {}

          _position = {
            ..._position,
            farmId: id,
            eternalRewardToken: _rewardToken,
            eternalBonusRewardToken: _bonusRewardToken,
            eternalStartTime: startTime,
            eternalEndTime: endTime,
            multiplierToken: _multiplierToken,
            tier1Multiplier,
            tier2Multiplier,
            tier3Multiplier,
            tokenAmountForTier1,
            tokenAmountForTier2,
            tokenAmountForTier3,
            isDetached,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            pool: newPool,
            eternalEarned:
              rewardRes && _rewardToken
                ? formatUnits(rewardRes.reward, _rewardToken.decimals)
                : 0,
            eternalBonusEarned:
              rewardRes && _bonusRewardToken
                ? formatUnits(rewardRes.bonusReward, _bonusRewardToken.decimals)
                : 0,
          };
        } else {
          const res = await fetch(
            `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/eternal-farms-pool/${position.pool}?chainId=${chainId}`,
          );
          if (res.ok) {
            const data = await res.json();
            const eternalFarmings =
              data && data.data && data.data.eternalFarms
                ? data.data.eternalFarms
                : [];

            if (
              eternalFarmings.filter(
                (farm: any) => +farm.rewardRate || +farm.bonusRewardRate,
              ).length !== 0
            ) {
              _position = {
                ..._position,
                eternalAvailable: true,
              };
            }
          }
        }

        _positions.push(_position);
      }
      return _positions;
    } catch (err) {
      return [];
    }
  }

  const { isLoading, data } = useQuery({
    queryKey: ['v3FarmTransferredPositions', chainId, account, !!provider],
    queryFn: fetchTransferredPositions,
    refetchInterval: 300000,
  });

  return { isLoading, data };
}

export function useFarmPositionsForPool(
  pool: PoolChartSubgraph,
  minRangeLength: string,
) {
  const { chainId, account } = useActiveWeb3React();

  async function fetchPositionsForPool() {
    if (!chainId || !account) return null;

    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/pool-positions/${account}?chainId=${chainId}&poolId=${pool.id}&minRangeLength=${minRangeLength}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const positionsTransferred =
        data && data.data && data.data.positions ? data.data.positions : [];

      const _positions: Position[] = [];

      let _position: Position;

      //Hack
      for (const position of positionsTransferred) {
        _position = { ...position, onFarmingCenter: position.onFarmingCenter };

        _positions.push(_position);
      }

      return _positions;
    } catch (err) {
      return null;
    }
  }

  const lastTxHash = useLastTransactionHash();
  const { isLoading, data } = useQuery({
    queryKey: [
      'v3FarmPositionsForPool',
      chainId,
      account,
      pool.id,
      minRangeLength,
      lastTxHash,
    ],
    queryFn: fetchPositionsForPool,
  });

  return { isLoading, data };
}

export function usePositionsOnFarmer(account: string | null | undefined) {
  const { chainId } = useActiveWeb3React();

  async function fetchPositionsOnFarmer() {
    if (!account) return null;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/transferred-positions/${account}?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const positionsTransferred =
        data && data.data && data.data.positions ? data.data.positions : [];

      if (positionsTransferred.length === 0) {
        return {
          transferredPositionsIds: [],
          oldTransferredPositionsIds: [],
        };
      }

      const transferredPositionsIds: string[] = positionsTransferred.map(
        (position: any) => position.id,
      );

      const oldTransferredPositionsIds: string[] = [];

      return {
        transferredPositionsIds,
        oldTransferredPositionsIds,
      };
    } catch (err) {
      return null;
    }
  }

  const lastTxHash = useLastTransactionHash();
  const { isLoading, data } = useQuery({
    queryKey: ['v3PositionsOnFarmer', lastTxHash, chainId, account],
    queryFn: fetchPositionsOnFarmer,
  });

  return { isLoading, data };
}

export function useEternalFarmPoolAPRs() {
  const { chainId } = useActiveWeb3React();

  async function fetchEternalFarmPoolAprs() {
    if (!chainId) return null;

    try {
      const aprs: Aprs = await fetchPoolsAPR(chainId);
      return aprs;
    } catch (err) {
      return null;
    }
  }

  const { isLoading, data } = useQuery({
    queryKey: ['v3EternalFarmPoolAprs', chainId],
    queryFn: fetchEternalFarmPoolAprs,
    refetchInterval: 300000,
  });

  return { isLoading, data };
}

export function useEternalFarmAprs() {
  const { chainId } = useActiveWeb3React();

  async function fetchEternalFarmAprs() {
    if (!chainId) return null;

    try {
      const aprs: Aprs = await fetchEternalFarmAPR(chainId);
      return aprs;
    } catch (err) {
      return null;
    }
  }
  const { isLoading, data } = useQuery({
    queryKey: ['v3EternalFarmAprs', chainId],
    queryFn: fetchEternalFarmAprs,
    refetchInterval: 300000,
  });

  return { isLoading, data };
}

export function useEternalFarmTvls() {
  const { chainId } = useActiveWeb3React();

  async function fetchEternalFarmTvls() {
    if (!chainId) return null;

    try {
      const tvls = await fetchEternalFarmTVL(chainId);
      return tvls;
    } catch (err) {
      return null;
    }
  }
  const { isLoading, data } = useQuery({
    queryKey: ['v3EternalFarmTvls', chainId],
    queryFn: fetchEternalFarmTvls,
    refetchInterval: 300000,
  });

  return { isLoading, data };
}

export function useEternalFarms() {
  const { chainId, provider } = useActiveWeb3React();
  const tokenMap = useSelectedTokenList();
  const config = getConfig(chainId);
  const qsFarmAvailable = config['farm']['quickswap'];

  async function fetchEternalFarms() {
    if (!provider || !qsFarmAvailable) return null;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/farming/eternal-farms?chainId=${chainId}`,
      );
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const eternalFarmings =
        data && data.data && data.data.farms ? data.data.farms : [];

      if (eternalFarmings.length === 0) {
        return null;
      }

      const _eternalFarmings: FormattedEternalFarming[] = [];

      for (const farming of eternalFarmings) {
        try {
          const pool = farming.pool;
          const rewardToken = getTokenFromAddress(
            farming.rewardToken,
            chainId ?? ChainId.MATIC,
            tokenMap,
            [],
          );
          const bonusRewardToken = getTokenFromAddress(
            farming.bonusRewardToken,
            chainId ?? ChainId.MATIC,
            tokenMap,
            [],
          );
          const wrappedToken0 = getTokenFromAddress(
            pool.token0.id,
            chainId ?? ChainId.MATIC,
            tokenMap,
            [],
          );
          const wrappedToken1 = getTokenFromAddress(
            pool.token1.id,
            chainId ?? ChainId.MATIC,
            tokenMap,
            [],
          );
          const newPool = {
            ...pool,
            token0: wrappedToken0 ?? pool.token0,
            token1: wrappedToken1 ?? pool.token1,
          };
          const multiplierToken = getTokenFromAddress(
            farming.multiplierToken,
            chainId ?? ChainId.MATIC,
            tokenMap,
            [],
          );

          _eternalFarmings.push({
            ...farming,
            rewardToken,
            bonusRewardToken,
            multiplierToken,
            pool: newPool,
          });
        } catch (e) {
          console.log(e);
        }
      }

      return _eternalFarmings;
    } catch (err) {
      return null;
    }
  }

  const { isLoading, data } = useQuery({
    queryKey: ['v3EternalFarms', !!provider, chainId, qsFarmAvailable],
    queryFn: fetchEternalFarms,
    refetchInterval: 300000,
  });

  return { isLoading, data };
}
