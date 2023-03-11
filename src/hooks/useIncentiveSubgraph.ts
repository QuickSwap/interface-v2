import React, { useState } from 'react';
import { useActiveWeb3React } from 'hooks';
import { Contract, providers } from 'ethers';
import ERC20_ABI from 'constants/abis/erc20.json';
import NON_FUN_POS_MAN from 'abis/non-fun-pos-man.json';
import FARMING_CENTER_ABI from 'abis/farming-center.json';
import FINITE_FARMING_ABI from 'abis/finite-farming.json';
import {
  FARMING_CENTER,
  FINITE_FARMING,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
} from '../constants/v3/addresses';
import {
  FETCH_ETERNAL_FARM,
  FETCH_ETERNAL_FARM_FROM_POOL,
  FETCH_FINITE_FARM_FROM_POOL,
  FETCH_LIMIT,
  FETCH_POOL,
  FETCH_REWARDS,
  FETCH_TOKEN,
  FETCH_TOKEN_FARM,
  FUTURE_EVENTS,
  HAS_TRANSFERED_POSITIONS,
  INFINITE_EVENTS,
  POSITIONS_ON_ETERNAL_FARMING,
  TRANSFERED_POSITIONS,
  TRANSFERED_POSITIONS_FOR_POOL,
} from '../utils/graphql-queries';
import { useClients } from './subgraph/useClients';
import { formatUnits } from '@ethersproject/units';
import {
  Deposit,
  DetachedEternalFarming,
  EternalFarming,
  FormattedEternalFarming,
  FormattedRewardInterface,
  PoolChartSubgraph,
  PoolSubgraph,
  Position,
  SubgraphResponse,
  TickFarming,
  TokenSubgraph,
  Aprs,
  FutureFarmingEvent,
} from '../models/interfaces';
import {
  fetchEternalFarmAPR,
  fetchEternalFarmTVL,
  fetchPoolsAPR,
} from 'utils/api';
import { formatTokenSymbol } from 'utils/v3-graph';

export function useFarmingSubgraph() {
  const { chainId, account, library } = useActiveWeb3React();
  const { v3Client, farmingClient } = useClients();

  const [positionsForPool, setPositionsForPool] = useState<Position[] | null>(
    null,
  );
  const [positionsForPoolLoading, setPositionsForPoolLoading] = useState<
    boolean
  >(false);

  const [transferredPositions, setTransferredPositions] = useState<
    Deposit[] | null
  >(null);
  const [
    transferredPositionsLoading,
    setTransferredPositionsLoading,
  ] = useState<boolean>(false);

  const [hasTransferredPositions, setHasTransferredPositions] = useState<
    boolean | null
  >(null);
  const [
    hasTransferredPositionsLoading,
    setHasTransferredPositionsLoading,
  ] = useState<boolean>(false);

  const [rewardsResult, setRewardsResult] = useState<
    FormattedRewardInterface[] | string
  >([]);
  const [rewardsLoading, setRewardsLoading] = useState<boolean>(false);

  const [futureEvents, setFutureEvents] = useState<FutureFarmingEvent[] | null>(
    null,
  );
  const [futureEventsLoading, setFutureEventsLoading] = useState<boolean>(
    false,
  );

  const [positionsOnFarmer, setPositionsOnFarmer] = useState<{
    transferredPositionsIds: string[];
    oldTransferredPositionsIds: string[];
  } | null>(null);
  const [positionsOnFarmerLoading, setPositionsOnFarmerLoading] = useState<
    boolean
  >(false);

  const [eternalFarms, setEternalFarms] = useState<
    FormattedEternalFarming[] | null
  >(null);
  const [eternalFarmsLoading, setEternalFarmsLoading] = useState<boolean>(
    false,
  );

  const [eternalFarmPoolAprs, setEternalFarmPoolAprs] = useState<
    Aprs | undefined
  >();
  const [eternalFarmPoolAprsLoading, setEternalFarmPoolAprsLoading] = useState<
    boolean
  >(false);

  const [eternalFarmAprs, setEternalFarmAprs] = useState<Aprs | undefined>();
  const [eternalFarmAprsLoading, setEternalFarmAprsLoading] = useState<boolean>(
    false,
  );

  const [eternalFarmTvls, setEternalFarmTvls] = useState<any>();
  const [eternalFarmTvlsLoading, setEternalFarmTvlsLoading] = useState<boolean>(
    false,
  );

  const [positionsEternal, setPositionsEternal] = useState<
    TickFarming[] | null
  >(null);
  const [positionsEternalLoading, setPositionsEternalLoading] = useState<
    boolean
  >(false);

  const provider = library
    ? new providers.Web3Provider(library.provider)
    : undefined;

  async function getEvents(events: any[], farming = false) {
    const _events: any[] = [];

    for (let i = 0; i < events.length; i++) {
      const pool = await fetchPool(events[i].pool);
      const rewardToken = await fetchToken(events[i].rewardToken, farming);
      const bonusRewardToken = await fetchToken(
        events[i].bonusRewardToken,
        farming,
      );
      const multiplierToken = await fetchToken(
        events[i].multiplierToken,
        farming,
      );

      const _event: any = {
        ...events[i],
        pool,
        rewardToken,
        bonusRewardToken,
        multiplierToken,
        reward: formatUnits(events[i].reward, rewardToken.decimals),
        bonusReward: formatUnits(
          events[i].bonusReward,
          bonusRewardToken.decimals,
        ),
      };

      _events.push({ ..._event });
    }

    return _events;
  }

  async function fetchToken(tokenId: string, farming = false) {
    try {
      const {
        data: { tokens },
        errors,
      } = await (farming ? farmingClient : v3Client).query<
        SubgraphResponse<TokenSubgraph[]>
      >({
        query: farming ? FETCH_TOKEN_FARM() : FETCH_TOKEN(),
        variables: { tokenId },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      return tokens[0];
    } catch (err) {
      throw new Error('Fetch token ' + err);
    }
  }

  async function fetchPool(poolId: string) {
    try {
      const {
        data: { pools },
        errors,
      } = await v3Client.query<SubgraphResponse<PoolSubgraph[]>>({
        query: FETCH_POOL(),
        variables: { poolId },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      return {
        ...pools[0],
        token0: {
          ...pools[0].token0,
          symbol: formatTokenSymbol(pools[0].token0.id, pools[0].token0.symbol),
        },
        token1: {
          ...pools[0].token1,
          symbol: formatTokenSymbol(pools[0].token1.id, pools[0].token1.symbol),
        },
      };
    } catch (err) {
      throw new Error('Fetch pools ' + err);
    }
  }

  async function fetchLimit(limitFarmingId: string) {
    try {
      const {
        data: { limitFarmings },
        errors,
      } = await farmingClient.query<SubgraphResponse<FutureFarmingEvent[]>>({
        query: FETCH_LIMIT(),
        variables: { limitFarmingId },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      return limitFarmings[0];
    } catch (err) {
      throw new Error('Fetch limit farmings ' + err);
    }
  }

  async function fetchEternalFarming(farmId: string) {
    try {
      const {
        data: { eternalFarmings },
        errors,
      } = await farmingClient.query<SubgraphResponse<DetachedEternalFarming[]>>(
        {
          query: FETCH_ETERNAL_FARM(),
          variables: { farmId },
        },
      );

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      return eternalFarmings[0];
    } catch (err) {
      throw new Error('Fetch eternal farming ' + err.message);
    }
  }

  async function fetchRewards(reload?: boolean) {
    if (!account || !chainId) return;

    try {
      setRewardsLoading(true);

      const {
        data: { rewards },
        errors,
      } = await farmingClient.query({
        query: FETCH_REWARDS(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { account },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      if (!provider) throw new Error('No provider');

      const newRewards: any[] = [];

      for (const reward of rewards) {
        const rewardContract = new Contract(
          reward.rewardAddress,
          ERC20_ABI,
          provider,
        );

        const symbol = await rewardContract.symbol();
        const name = await rewardContract.name();
        const decimals = await rewardContract.decimals();

        const newReward = {
          ...reward,
          amount:
            reward.amount > 0
              ? (reward.amount / Math.pow(10, decimals)).toFixed(decimals)
              : 0,
          trueAmount: reward.amount,
          symbol,
          name,
        };

        newRewards.push(newReward);
      }

      setRewardsResult(newRewards);
    } catch (err) {
      setRewardsResult('failed');
      if (err instanceof Error) {
        throw new Error('Reward fetching ' + err.message);
      }
    }

    setRewardsLoading(false);
  }

  async function fetchFutureEvents(reload?: boolean) {
    try {
      setFutureEventsLoading(true);

      const {
        data: { limitFarmings: futureEvents },
        errors,
      } = await farmingClient.query<SubgraphResponse<FutureFarmingEvent[]>>({
        query: FUTURE_EVENTS(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { timestamp: Math.round(Date.now() / 1000) },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      if (futureEvents.length === 0) {
        setFutureEvents([]);
        setFutureEventsLoading(false);
        return;
      }

      setFutureEvents(await getEvents(futureEvents, true));
    } catch (err) {
      throw new Error('Future limit farmings fetching ' + err);
    } finally {
      setFutureEventsLoading(false);
    }
  }

  async function fetchHasTransferredPositions() {
    if (!chainId || !account) return;

    if (!provider) throw new Error('No provider');

    try {
      setHasTransferredPositionsLoading(true);

      const {
        data: { deposits: positionsTransferred },
        errors,
      } = await farmingClient.query<SubgraphResponse<Deposit[]>>({
        query: HAS_TRANSFERED_POSITIONS(),
        fetchPolicy: 'network-only',
        variables: { account },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      setHasTransferredPositions(Boolean(positionsTransferred.length));
      setHasTransferredPositionsLoading(false);
    } catch (err) {
      throw new Error(
        'Has transferred positions ' + err.code + ' ' + err.message,
      );
    } finally {
      setHasTransferredPositionsLoading(false);
    }
  }

  async function fetchTransferredPositions(reload?: boolean) {
    if (!chainId || !account) return;

    if (!provider) throw new Error('No provider');

    try {
      setTransferredPositionsLoading(true);

      const {
        data: { deposits: positionsTransferred },
        errors,
      } = await farmingClient.query<SubgraphResponse<Deposit[]>>({
        query: TRANSFERED_POSITIONS(true),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { account },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      if (positionsTransferred.length === 0) {
        setTransferredPositions([]);
        setTransferredPositionsLoading(false);
        return;
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
          const _pool = await fetchPool(position.pool);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          _position = { ..._position, pool: _pool };
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
          } = await fetchLimit(position.limitFarming);

          const rewardInfo = await finiteFarmingContract.callStatic.getRewardInfo(
            [rewardToken, bonusRewardToken, pool, +startTime, +endTime],
            +position.id,
          );

          const _rewardToken = await fetchToken(rewardToken);
          const _bonusRewardToken = await fetchToken(bonusRewardToken);
          const _multiplierToken = await fetchToken(multiplierToken, true);
          const _pool = await fetchPool(pool);

          _position = {
            ..._position,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            pool: _pool,
            limitRewardToken: _rewardToken,
            limitBonusRewardToken: _bonusRewardToken,
            limitStartTime: +startTime,
            limitEndTime: +endTime,
            started: +startTime * 1000 < Date.now(),
            ended: +endTime * 1000 < Date.now(),
            createdAtTimestamp: +createdAtTimestamp,
            limitEarned: rewardInfo[0]
              ? formatUnits(rewardInfo[0], _rewardToken.decimals)
              : 0,
            limitBonusEarned: rewardInfo[1]
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
          const {
            data: { limitFarmings },
            errors,
          } = await farmingClient.query({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            query: FETCH_FINITE_FARM_FROM_POOL([position.pool]),
            fetchPolicy: 'network-only',
          });

          if (errors) {
            const error = errors[0];
            throw new Error(`${error.name} ${error.message}`);
          }

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
          } = await fetchEternalFarming(position.eternalFarming);

          const farmingCenterContract = new Contract(
            FARMING_CENTER[chainId],
            FARMING_CENTER_ABI,
            provider.getSigner(),
          );

          const {
            reward,
            bonusReward,
          } = await farmingCenterContract.callStatic.collectRewards(
            [rewardToken, bonusRewardToken, pool, startTime, endTime],
            +position.id,
            { from: account },
          );

          const _rewardToken = await fetchToken(rewardToken);
          const _bonusRewardToken = await fetchToken(bonusRewardToken);
          const _pool = await fetchPool(pool);
          const _multiplierToken = await fetchToken(multiplierToken);

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
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            pool: _pool,
            eternalEarned: formatUnits(reward, _rewardToken.decimals),
            eternalBonusEarned: formatUnits(
              bonusReward,
              _bonusRewardToken.decimals,
            ),
          };
        } else {
          const {
            data: { eternalFarmings },
            errors,
          } = await farmingClient.query({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            query: FETCH_ETERNAL_FARM_FROM_POOL([position.pool]),
            fetchPolicy: 'network-only',
          });

          if (errors) {
            const error = errors[0];
            throw new Error(`${error.name} ${error.message}`);
          }

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

        _positions.push(_position);
      }
      setTransferredPositions(_positions);
    } catch (err) {
      throw new Error(
        'Transferred positions ' + 'code: ' + err.code + ', ' + err.message,
      );
    } finally {
      setTransferredPositionsLoading(false);
    }
  }

  async function fetchPositionsOnEternalFarming(reload?: boolean) {
    if (!chainId || !account) return;

    if (!provider) throw new Error('No provider');

    setPositionsEternalLoading(true);

    try {
      const {
        data: { deposits: eternalPositions },
        errors,
      } = await farmingClient.query<SubgraphResponse<Position[]>>({
        query: POSITIONS_ON_ETERNAL_FARMING(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { account },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      if (eternalPositions.length === 0) {
        setPositionsEternal([]);
        setPositionsEternalLoading(false);
        return;
      }

      const _positions: TickFarming[] = [];

      for (const position of eternalPositions) {
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

        let _position: TickFarming = {
          tickLower,
          tickUpper,
          liquidity,
          token0,
          token1,
        };

        const {
          rewardToken,
          bonusRewardToken,
          pool,
          startTime,
          endTime,
        } = await fetchEternalFarming(String(position.eternalFarming));

        const _pool = await fetchPool(pool);
        const _rewardToken = await fetchToken(rewardToken);
        const _bonusRewardToken = await fetchToken(bonusRewardToken);

        _position = {
          ..._position,
          ...position,
          pool: _pool,
          rewardToken: _rewardToken,
          bonusRewardToken: _bonusRewardToken,
          startTime,
          endTime,
        };

        _positions.push(_position);
      }

      setPositionsEternal(_positions);
    } catch (error) {
      throw new Error('Eternal farms loading' + error.code + error.message);
    }
  }

  async function fetchPositionsForPool(
    pool: PoolChartSubgraph,
    minRangeLength: string,
  ) {
    if (!chainId || !account) return;

    try {
      setPositionsForPoolLoading(true);

      const {
        data: { deposits: positionsTransferred },
        errors: errorsTransferred,
      } = await farmingClient.query<SubgraphResponse<Position[]>>({
        query: TRANSFERED_POSITIONS_FOR_POOL(),
        fetchPolicy: 'network-only',
        variables: { account, pool: pool.id, minRangeLength },
      });

      if (errorsTransferred) {
        const error = errorsTransferred[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      const _positions: Position[] = [];

      let _position: Position;

      //Hack
      for (const position of positionsTransferred) {
        _position = { ...position, onFarmingCenter: position.onFarmingCenter };

        _positions.push(_position);
      }

      setPositionsForPool(_positions);
    } catch (err) {
      throw new Error('Positions for pools ' + err);
    } finally {
      setPositionsForPoolLoading(false);
    }
  }

  async function fetchPositionsOnFarmer(account: string) {
    try {
      setPositionsOnFarmerLoading(true);

      const {
        data: { deposits: positionsTransferred },
        errors,
      } = await farmingClient.query<SubgraphResponse<Position[]>>({
        query: TRANSFERED_POSITIONS(true),
        fetchPolicy: 'network-only',
        variables: { account },
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      if (positionsTransferred.length === 0) {
        setPositionsOnFarmer({
          transferredPositionsIds: [],
          oldTransferredPositionsIds: [],
        });
        setPositionsOnFarmerLoading(false);
        return;
      }

      const transferredPositionsIds = positionsTransferred.map(
        (position) => position.id,
      );

      const oldTransferredPositionsIds: string[] = [];

      setPositionsOnFarmer({
        transferredPositionsIds,
        oldTransferredPositionsIds,
      });
    } catch (err) {
      setPositionsOnFarmerLoading(false);
      throw new Error('Fetching positions on farmer ' + err);
    }
  }

  async function fetchEternalFarmPoolAprs() {
    setEternalFarmPoolAprsLoading(true);

    try {
      const aprs: Aprs = await fetchPoolsAPR();
      setEternalFarmPoolAprs(aprs);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          'Error while fetching eternal farms pool Aprs' + err.message,
        );
      }
    } finally {
      setEternalFarmPoolAprsLoading(false);
    }
  }

  async function fetchEternalFarmAprs() {
    setEternalFarmAprsLoading(true);

    try {
      const aprs: Aprs = await fetchEternalFarmAPR();
      setEternalFarmAprs(aprs);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          'Error while fetching eternal farms Aprs' + err.message,
        );
      }
    } finally {
      setEternalFarmAprsLoading(false);
    }
  }

  async function fetchEternalFarmTvls() {
    setEternalFarmTvlsLoading(true);

    try {
      const tvls = await fetchEternalFarmTVL();
      setEternalFarmTvls(tvls);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(
          'Error while fetching eternal farms Tvls' + err.message,
        );
      }
    } finally {
      setEternalFarmTvlsLoading(false);
    }
  }

  async function fetchEternalFarms(reload: boolean, detached = false) {
    setEternalFarmsLoading(true);

    try {
      const {
        data: { eternalFarmings },
        errors,
      } = await farmingClient.query<SubgraphResponse<EternalFarming[]>>({
        query: INFINITE_EVENTS,
        variables: {
          detached,
        },
        fetchPolicy: reload ? 'network-only' : 'cache-first',
      });

      if (errors) {
        const error = errors[0];
        throw new Error(`${error.name} ${error.message}`);
      }

      if (eternalFarmings.length === 0) {
        setEternalFarms([]);
        setEternalFarmsLoading(false);
        return;
      }

      let _eternalFarmings: FormattedEternalFarming[] = [];
      // TODO
      // .filter(farming => +farming.bonusRewardRate || +farming.rewardRate)
      for (const farming of eternalFarmings) {
        const pool = await fetchPool(farming.pool);
        const rewardToken = await fetchToken(farming.rewardToken);
        const bonusRewardToken = await fetchToken(farming.bonusRewardToken);
        const multiplierToken = await fetchToken(farming.multiplierToken, true);

        _eternalFarmings = [
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          ..._eternalFarmings,
          {
            ...farming,
            rewardToken,
            bonusRewardToken,
            multiplierToken,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            pool,
          },
        ];
      }

      setEternalFarms(_eternalFarmings);
    } catch (err) {
      setEternalFarms(null);
      if (err instanceof Error) {
        throw new Error('Error while fetching eternal farms ' + err.message);
      }
    } finally {
      setEternalFarmsLoading(false);
    }
  }

  return {
    fetchRewards: {
      rewardsResult,
      rewardsLoading,
      fetchRewardsFn: fetchRewards,
    },
    fetchFutureEvents: {
      futureEvents,
      futureEventsLoading,
      fetchFutureEventsFn: fetchFutureEvents,
    },
    fetchPositionsForPool: {
      positionsForPool,
      positionsForPoolLoading,
      fetchPositionsForPoolFn: fetchPositionsForPool,
    },
    fetchTransferredPositions: {
      transferredPositions,
      transferredPositionsLoading,
      fetchTransferredPositionsFn: fetchTransferredPositions,
    },
    fetchHasTransferredPositions: {
      hasTransferredPositions,
      hasTransferredPositionsLoading,
      fetchHasTransferredPositionsFn: fetchHasTransferredPositions,
    },
    fetchPositionsOnFarmer: {
      positionsOnFarmer,
      positionsOnFarmerLoading,
      fetchPositionsOnFarmerFn: fetchPositionsOnFarmer,
    },
    fetchEternalFarms: {
      eternalFarms,
      eternalFarmsLoading,
      fetchEternalFarmsFn: fetchEternalFarms,
    },
    fetchEternalFarmPoolAprs: {
      eternalFarmPoolAprs,
      eternalFarmPoolAprsLoading,
      fetchEternalFarmPoolAprsFn: fetchEternalFarmPoolAprs,
    },
    fetchEternalFarmAprs: {
      eternalFarmAprs,
      eternalFarmAprsLoading,
      fetchEternalFarmAprsFn: fetchEternalFarmAprs,
    },
    fetchEternalFarmTvls: {
      eternalFarmTvls,
      eternalFarmTvlsLoading,
      fetchEternalFarmTvlsFn: fetchEternalFarmTvls,
    },
    fetchPositionsOnEternalFarmings: {
      positionsEternal,
      positionsEternalLoading,
      fetchPositionsOnEternalFarmingFn: fetchPositionsOnEternalFarming,
    },
  };
}
