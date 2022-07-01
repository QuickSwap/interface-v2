import { useEffect, useState } from 'react';
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
} from '../constants/addresses';
import { BigNumber } from '@ethersproject/bignumber';
import {
  CURRENT_EVENTS,
  FETCH_ETERNAL_FARM,
  FETCH_ETERNAL_FARM_FROM_POOL,
  FETCH_FINITE_FARM_FROM_POOL,
  FETCH_INCENTIVE,
  FETCH_POOL,
  FETCH_REWARDS,
  FETCH_TOKEN,
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
  FarmingEvent,
  FormattedEternalFarming,
  FormattedRewardInterface,
  PoolChartSubgraph,
  PoolSubgraph,
  Position,
  SubgraphResponse,
  TickFarming,
  TokenSubgraph,
} from '../models/interfaces';
import { Aprs, FutureFarmingEvent } from '../models/interfaces';
import {
  fetchEternalFarmAPR,
  fetchLimitFarmAPR,
  fetchLimitFarmTVL,
} from 'utils/api';
import { useEthPrices } from './useEthPrices';

export function useIncentiveSubgraph() {
  const { chainId, account, library } = useActiveWeb3React();

  const { dataClient, farmingClient, oldFarmingClient } = useClients();

  const ethPrices = useEthPrices();

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

  const [allEvents, setAllEvents] = useState<{
    currentEvents: FarmingEvent[];
    futureEvents: FutureFarmingEvent[];
  } | null>(null);
  const [allEventsLoading, setAllEventsLoading] = useState<boolean>(false);

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

  const [positionsEternal, setPositionsEternal] = useState<
    TickFarming[] | null
  >(null);
  const [positionsEternalLoading, setPositionsEternalLoading] = useState<
    boolean
  >(false);

  const provider = library
    ? new providers.Web3Provider(library.provider)
    : undefined;

  async function getEvents(events: any[]) {
    const _events: any[] = [];

    for (let i = 0; i < events.length; i++) {
      const pool = await fetchPool(events[i].pool);
      const rewardToken = await fetchToken(events[i].rewardToken);
      const bonusRewardToken = await fetchToken(events[i].bonusRewardToken);
      const lockedToken = await fetchToken(events[i].multiplierToken);

      const _event: any = {
        ...events[i],
        pool,
        rewardToken,
        bonusRewardToken,
        lockedToken,
        reward: formatUnits(
          BigNumber.from(events[i].reward),
          rewardToken.decimals,
        ),
        bonusReward: formatUnits(
          BigNumber.from(events[i].bonusReward),
          bonusRewardToken.decimals,
        ),
      };

      _events.push({ ..._event });
    }

    return _events;
  }

  async function fetchToken(tokenId: string) {
    try {
      const {
        data: { tokens },
        error,
      } = await dataClient.query<SubgraphResponse<TokenSubgraph[]>>({
        query: FETCH_TOKEN(),
        variables: { tokenId },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      return tokens[0];
    } catch (err) {
      throw new Error('Fetch token ' + err);
    }
  }

  async function fetchPool(poolId: string) {
    try {
      const {
        data: { pools },
        error,
      } = await dataClient.query<SubgraphResponse<PoolSubgraph[]>>({
        query: FETCH_POOL(),
        variables: { poolId },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      return pools[0];
    } catch (err) {
      throw new Error('Fetch pools ' + err);
    }
  }

  async function fetchIncentive(incentiveId: string) {
    try {
      const {
        data: { incentives },
        error,
      } = await farmingClient.query<SubgraphResponse<FutureFarmingEvent[]>>({
        query: FETCH_INCENTIVE(),
        variables: { incentiveId },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      return incentives[0];
    } catch (err) {
      throw new Error('Fetch incentives ' + err);
    }
  }

  async function fetchEternalFarming(farmId: string) {
    try {
      const {
        data: { eternalFarmings },
        error,
      } = await farmingClient.query<SubgraphResponse<DetachedEternalFarming[]>>(
        {
          query: FETCH_ETERNAL_FARM(),
          variables: { farmId },
        },
      );

      if (error) throw new Error(`${error.name} ${error.message}`);

      return eternalFarmings[0];
    } catch (err) {
      throw new Error('Fetch infinite farming ' + err.message);
    }
  }

  async function fetchRewards(reload?: boolean) {
    if (!account || !chainId) return;

    try {
      setRewardsLoading(true);

      const {
        data: { rewards },
        error,
      } = await farmingClient.query({
        query: FETCH_REWARDS(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { account },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

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
        data: { incentives: futureEvents },
        error,
      } = await farmingClient.query<SubgraphResponse<FutureFarmingEvent[]>>({
        query: FUTURE_EVENTS(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { timestamp: Math.round(Date.now() / 1000) },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      if (futureEvents.length === 0) {
        setFutureEvents([]);
        setFutureEventsLoading(false);
        return;
      }

      setFutureEvents(await getEvents(futureEvents));
    } catch (err) {
      throw new Error('Future incentives fetching ' + err);
    } finally {
      setFutureEventsLoading(false);
    }
  }

  async function fetchAllEvents(reload?: boolean) {
    setAllEventsLoading(true);

    try {
      const {
        data: { incentives: currentEvents },
        error,
      } = await farmingClient.query<SubgraphResponse<FarmingEvent[]>>({
        query: CURRENT_EVENTS(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: {
          startTime: Math.round(Date.now() / 1000),
          endTime: Math.round(Date.now() / 1000),
        },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      const {
        data: { incentives: futureEvents },
        error: _error,
      } = await farmingClient.query<SubgraphResponse<FutureFarmingEvent[]>>({
        query: FUTURE_EVENTS(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { timestamp: Math.round(Date.now() / 1000) },
      });

      if (_error) throw new Error(`${_error.name} ${_error.message}`);

      if (currentEvents.length === 0 && futureEvents.length === 0) {
        setAllEvents({
          currentEvents: [],
          futureEvents: [],
        });
        setAllEventsLoading(false);
        return;
      }

      const eventTVL = await fetchLimitFarmTVL();
      const aprs: Aprs = await fetchLimitFarmAPR();

      const price = 1;

      const EVENT_LOCK = 100_000;

      setAllEvents({
        currentEvents: await getEvents(
          currentEvents.map((el) => ({
            ...el,
            active: true,
            apr: aprs[el.id] ? aprs[el.id] : 37,
          })),
        ),
        futureEvents: await getEvents(
          futureEvents.map((el) => ({
            ...el,
            locked:
              eventTVL[el.id] === undefined
                ? false
                : eventTVL[el.id] * price >= EVENT_LOCK,
            apr: aprs[el.id] ? aprs[el.id] : 37,
          })),
        ),
      });

      setAllEventsLoading(false);
    } catch (err) {
      throw new Error('Error while fetching current incentives ' + err);
    } finally {
      setAllEventsLoading(false);
    }
  }

  async function fetchHasTransferredPositions() {
    if (!chainId || !account) return;

    if (!provider) throw new Error('No provider');

    try {
      setHasTransferredPositionsLoading(true);

      const {
        data: { deposits: positionsTransferred },
        error,
      } = await farmingClient.query<SubgraphResponse<Deposit[]>>({
        query: HAS_TRANSFERED_POSITIONS(),
        fetchPolicy: 'network-only',
        variables: { account },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

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
        error,
      } = await farmingClient.query<SubgraphResponse<Deposit[]>>({
        query: TRANSFERED_POSITIONS(true),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { account },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

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
          !position.incentive &&
          !position.eternalFarming &&
          typeof position.pool === 'string'
        ) {
          const _pool = await fetchPool(position.pool);
          //@ts-ignore
          _position = { ..._position, pool: _pool };
        }

        if (position.incentive) {
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
            algbAmountForLevel1,
            algbAmountForLevel2,
            algbAmountForLevel3,
            level1multiplier,
            level2multiplier,
            level3multiplier,
          } = await fetchIncentive(position.incentive);

          const rewardInfo = await finiteFarmingContract.callStatic.getRewardInfo(
            [rewardToken, bonusRewardToken, pool, +startTime, +endTime],
            +position.id,
          );

          const _rewardToken = await fetchToken(rewardToken);
          const _bonusRewardToken = await fetchToken(bonusRewardToken);
          const _multiplierToken = await fetchToken(multiplierToken);
          const _pool = await fetchPool(pool);

          _position = {
            ..._position,
            //@ts-ignore
            pool: _pool,
            incentiveRewardToken: _rewardToken,
            incentiveBonusRewardToken: _bonusRewardToken,
            incentiveStartTime: +startTime,
            incentiveEndTime: +endTime,
            started: +startTime * 1000 < Date.now(),
            ended: +endTime * 1000 < Date.now(),
            createdAtTimestamp: +createdAtTimestamp,
            incentiveEarned: rewardInfo[0]
              ? formatUnits(
                  BigNumber.from(rewardInfo[0]),
                  _rewardToken.decimals,
                )
              : 0,
            incentiveBonusEarned: rewardInfo[1]
              ? formatUnits(
                  BigNumber.from(rewardInfo[1]),
                  _bonusRewardToken.decimals,
                )
              : 0,
            lockedToken: _multiplierToken,
            algbAmountForLevel1,
            algbAmountForLevel2,
            algbAmountForLevel3,
            level1multiplier,
            level2multiplier,
            level3multiplier,
          };
        } else {
          const {
            data: { incentives },
            error,
          } = await farmingClient.query({
            //@ts-ignore
            query: FETCH_FINITE_FARM_FROM_POOL([position.pool]),
            fetchPolicy: 'network-only',
          });

          if (error) throw new Error(`${error.name} ${error.message}`);

          if (
            incentives.filter(
              (incentive: any) =>
                Math.round(Date.now() / 1000) < incentive.startTime,
            ).length !== 0
          ) {
            _position = {
              ..._position,
              finiteAvailable: true,
            };
          }
        }

        if (position.eternalFarming) {
          const {
            rewardToken,
            bonusRewardToken,
            pool,
            startTime,
            endTime,
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

          _position = {
            ..._position,
            eternalRewardToken: _rewardToken,
            eternalBonusRewardToken: _bonusRewardToken,
            eternalStartTime: startTime,
            eternalEndTime: endTime,
            //@ts-ignore
            pool: _pool,
            eternalEarned: formatUnits(
              BigNumber.from(reward),
              _rewardToken.decimals,
            ),
            eternalBonusEarned: formatUnits(
              BigNumber.from(bonusReward),
              _bonusRewardToken.decimals,
            ),
          };
        } else {
          const {
            data: { eternalFarmings },
            error,
          } = await farmingClient.query({
            //@ts-ignore
            query: FETCH_ETERNAL_FARM_FROM_POOL([position.pool]),
            fetchPolicy: 'network-only',
          });

          if (error) throw new Error(`${error.name} ${error.message}`);

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
      throw new Error('Transferred positions ' + err.code + ' ' + err.message);
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
        error,
      } = await farmingClient.query<SubgraphResponse<Position[]>>({
        query: POSITIONS_ON_ETERNAL_FARMING(),
        fetchPolicy: reload ? 'network-only' : 'cache-first',
        variables: { account },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

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
      throw new Error('Infinite farms loading' + error.code + error.message);
    }
  }

  async function fetchPositionsForPool(pool: PoolChartSubgraph) {
    if (!chainId || !account) return;

    try {
      setPositionsForPoolLoading(true);

      const {
        data: { deposits: positionsTransferred },
        error: errorTransferred,
      } = await farmingClient.query<SubgraphResponse<Position[]>>({
        query: TRANSFERED_POSITIONS_FOR_POOL(),
        fetchPolicy: 'network-only',
        variables: { account, pool: pool.id },
      });

      if (errorTransferred)
        throw new Error(`${errorTransferred.name} ${errorTransferred.message}`);

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
        error,
      } = await farmingClient.query<SubgraphResponse<Position[]>>({
        query: TRANSFERED_POSITIONS(true),
        fetchPolicy: 'network-only',
        variables: { account },
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      const {
        data: { deposits: oldPositionsTransferred },
        error: _error,
      } = await oldFarmingClient.query<SubgraphResponse<Deposit[]>>({
        query: TRANSFERED_POSITIONS(false),
        fetchPolicy: 'network-only',
        variables: { account },
      });

      if (_error) throw new Error(`${_error.name} ${_error.message}`);

      if (
        positionsTransferred.length === 0 &&
        oldPositionsTransferred.length === 0
      ) {
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

      const oldTransferredPositionsIds = oldPositionsTransferred.map(
        (position) => position.id,
      );

      setPositionsOnFarmer({
        transferredPositionsIds,
        oldTransferredPositionsIds,
      });
    } catch (err) {
      setPositionsOnFarmerLoading(false);
      throw new Error('Fetching positions on farmer ' + err);
    }
  }

  async function fetchEternalFarms(reload: boolean) {
    setEternalFarmsLoading(true);

    try {
      const {
        data: { eternalFarmings },
        error,
      } = await farmingClient.query<SubgraphResponse<EternalFarming[]>>({
        query: INFINITE_EVENTS,
        fetchPolicy: reload ? 'network-only' : 'cache-first',
      });

      if (error) throw new Error(`${error.name} ${error.message}`);

      if (eternalFarmings.length === 0) {
        setEternalFarms([]);
        setEternalFarmsLoading(false);
        return;
      }

      const aprs: Aprs = await fetchEternalFarmAPR();

      let _eternalFarmings: FormattedEternalFarming[] = [];

      for (const farming of eternalFarmings.filter(
        (farming) => +farming.bonusRewardRate || +farming.rewardRate,
      )) {
        const pool = await fetchPool(farming.pool);
        const rewardToken = await fetchToken(farming.rewardToken);
        const bonusRewardToken = await fetchToken(farming.bonusRewardToken);

        const apr = aprs[farming.id] ? aprs[farming.id] : 200;

        _eternalFarmings = [
          //@ts-ignore
          ..._eternalFarmings,
          {
            ...farming,
            rewardToken,
            bonusRewardToken,
            //@ts-ignore
            pool,
            apr,
          },
        ];
      }

      setEternalFarms(_eternalFarmings);
    } catch (err) {
      setEternalFarms(null);
      if (err instanceof Error) {
        throw new Error('Error while fetching infinite farms ' + err.message);
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
    fetchAllEvents: {
      allEvents,
      allEventsLoading,
      fetchAllEventsFn: fetchAllEvents,
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
    fetchPositionsOnEternalFarmings: {
      positionsEternal,
      positionsEternalLoading,
      fetchPositionsOnEternalFarmingFn: fetchPositionsOnEternalFarming,
    },
  };
}
