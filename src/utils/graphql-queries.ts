import gql from 'graphql-tag';

//Farming

export const ONE_FARMING_EVENT = () => gql`
  query limitFarm($time: BigInt) {
    limitFarmings(
      orderBy: createdAtTimestamp
      orderDirection: desc
      first: 1
      where: { startTime_gt: $time, isDetached: false }
    ) {
      startTime
      endTime
    }
  }
`;

export const ONE_ETERNAL_FARMING = () => gql`
  query eternalFarm {
    eternalFarmings(where: { isDetached: false }, first: 1) {
      startTime
      endTime
    }
  }
`;

export const FETCH_REWARDS = () => gql`
  query fetchRewards($account: Bytes) {
    rewards(orderBy: amount, orderDirection: desc, where: { owner: $account }) {
      id
      rewardAddress
      amount
      owner
    }
  }
`;

export const FETCH_TOKEN = () => gql`
  query fetchToken($tokenId: ID) {
    tokens(where: { id: $tokenId }) {
      id
      symbol
      name
      decimals
      derivedMatic
    }
  }
`;

export const FETCH_TOKEN_FARM = () => gql`
  query fetchToken($tokenId: ID) {
    tokens(where: { id: $tokenId }) {
      id
      symbol
      name
      decimals
    }
  }
`;

export const FETCH_LIMIT = () => gql`
  query fetchLimit($limitFarmingId: ID) {
    limitFarmings(where: { id: $limitFarmingId }) {
      id
      rewardToken
      bonusRewardToken
      pool
      startTime
      endTime
      reward
      bonusReward
      multiplierToken
      createdAtTimestamp
      tier1Multiplier
      tier2Multiplier
      tier3Multiplier
      tokenAmountForTier1
      tokenAmountForTier2
      tokenAmountForTier3
      enterStartTime
      isDetached
      minRangeLength
    }
  }
`;

export const FETCH_ETERNAL_FARM = () => gql`
  query fetchEternalFarm($farmId: ID) {
    eternalFarmings(where: { id: $farmId }) {
      id
      rewardToken
      bonusRewardToken
      pool
      startTime
      endTime
      reward
      bonusReward
      rewardRate
      bonusRewardRate
      isDetached
      tier1Multiplier
      tier2Multiplier
      tier3Multiplier
      tokenAmountForTier1
      tokenAmountForTier2
      tokenAmountForTier3
      multiplierToken
      minRangeLength
    }
  }
`;

export const FETCH_ETERNAL_FARM_FROM_POOL = (pools: string[]) => {
  let poolString = `[`;
  pools.map((address) => {
    return (poolString += `"${address}",`);
  });
  poolString += ']';
  const queryString = `
      query eternalFarmingsFromPools {
        eternalFarmings(where: {pool_in: ${poolString}, isDetached: false}) {
          id
          rewardToken
          bonusRewardToken
          pool
          startTime
          endTime
          reward
          bonusReward
          rewardRate
          bonusRewardRate
          isDetached
          minRangeLength
        }
      }
      `;
  return gql(queryString);
};

export const FETCH_LIMIT_FARM_FROM_POOL = (pools: string[]) => {
  let poolString = `[`;
  pools.map((address) => {
    return (poolString += `"${address}",`);
  });
  poolString += ']';
  const now = Math.round(Date.now() / 1000);
  const queryString = `
    query limitFarmingsFromPools {
      limitFarmings(where: {pool_in: ${poolString}, isDetached: false, endTime_gt: ${now}}) {
        id
        createdAtTimestamp
        rewardToken
        bonusReward
        bonusRewardToken
        pool
        startTime
        endTime
        reward
        multiplierToken
        minRangeLength
      }
    }
    `;
  return gql(queryString);
};

export const FETCH_POOL = () => gql`
  query fetchPool($poolId: ID) {
    pools(where: { id: $poolId }) {
      id
      fee
      token0 {
        id
        decimals
        symbol
      }
      token1 {
        id
        decimals
        symbol
      }
      sqrtPrice
      liquidity
      tick
      feesUSD
      untrackedFeesUSD
    }
  }
`;

export const FETCH_POOL_FROM_TOKENS = () => gql`
  query fetchPoolFromTokens($token0: String, $token1: String) {
    pools0: pools(where: { token0: $token0, token1: $token1 }) {
      id
      fee
      token0 {
        id
        decimals
        symbol
      }
      token1 {
        id
        decimals
        symbol
      }
      sqrtPrice
      liquidity
      tick
      feesUSD
      untrackedFeesUSD
    }
    pools1: pools(where: { token0: $token1, token1: $token0 }) {
      id
      fee
      token0 {
        id
        decimals
        symbol
      }
      token1 {
        id
        decimals
        symbol
      }
      sqrtPrice
      liquidity
      tick
      feesUSD
      untrackedFeesUSD
    }
  }
`;

export const CHART_FEE_POOL_DATA = () => gql`
  query feeHourData(
    $pool: String
    $startTimestamp: BigInt
    $endTimestamp: BigInt
  ) {
    feeHourDatas(
      first: 1000
      where: {
        pool: $pool
        timestamp_gte: $startTimestamp
        timestamp_lte: $endTimestamp
      }
    ) {
      id
      pool
      fee
      changesCount
      timestamp
      minFee
      maxFee
      startFee
      endFee
    }
  }
`;

export const CHART_FEE_LAST_ENTRY = () => gql`
  query lastFeeHourData($pool: String) {
    feeHourDatas(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      where: { pool: $pool }
    ) {
      id
      pool
      fee
      changesCount
      timestamp
      minFee
      maxFee
      startFee
      endFee
    }
  }
`;
export const CHART_FEE_LAST_NOT_EMPTY = () => gql`
  query lastNotEmptyHourData($pool: String, $timestamp: BigInt) {
    feeHourDatas(
      first: 1
      orderBy: timestamp
      orderDirection: desc
      where: { pool: $pool, timestamp_lt: $timestamp }
    ) {
      id
      pool
      fee
      changesCount
      timestamp
      minFee
      maxFee
      startFee
      endFee
    }
  }
`;

export const CHART_POOL_LAST_NOT_EMPTY = () => gql`
  query lastNotEmptyPoolHourData($pool: String, $timestamp: Int) {
    poolHourDatas(
      first: 1
      orderBy: periodStartUnix
      orderDirection: desc
      where: { pool: $pool, periodStartUnix_lt: $timestamp }
    ) {
      periodStartUnix
      volumeUSD
      tvlUSD
      feesUSD
      untrackedVolumeUSD
      token1Price
      token0Price
    }
  }
`;

export const CHART_POOL_LAST_ENTRY = () => gql`
  query lastPoolHourData($pool: String) {
    poolHourDatas(
      first: 1
      where: { pool: $pool }
      orderBy: periodStartUnix
      orderDirection: desc
    ) {
      periodStartUnix
      volumeUSD
      tvlUSD
      feesUSD
      untrackedVolumeUSD
    }
  }
`;

export const CHART_POOL_DATA = () => gql`
  query poolHourData($pool: String, $startTimestamp: Int, $endTimestamp: Int) {
    poolHourDatas(
      first: 1000
      where: {
        pool: $pool
        periodStartUnix_gte: $startTimestamp
        periodStartUnix_lte: $endTimestamp
      }
      orderBy: periodStartUnix
      orderDirection: asc
      subgraphError: allow
    ) {
      periodStartUnix
      volumeUSD
      tvlUSD
      feesUSD
      untrackedVolumeUSD
      token0Price
      token1Price
    }
  }
`;

export const TOTAL_STATS = (block?: number) => {
  const qString = `
  query totalStats {
    factories ${block ? `(block: { number: ${block} })` : ''} {
      totalVolumeUSD
      untrackedVolumeUSD
      totalValueLockedUSD
      totalValueLockedUSDUntracked
    }
  }
`;
  return gql(qString);
};

export const LAST_EVENT = () => gql`
  query lastEvent {
    limitFarmings(
      first: 1
      orderDirection: desc
      orderBy: createdAtTimestamp
      where: { isDetached: false }
    ) {
      createdAtTimestamp
      id
      startTime
      endTime
    }
  }
`;

export const FUTURE_EVENTS = () => gql`
  query futureEvents($timestamp: BigInt) {
    limitFarmings(
      orderBy: startTime
      orderDirection: asc
      where: { startTime_gt: $timestamp, isDetached: false }
    ) {
      id
      createdAtTimestamp
      rewardToken
      bonusReward
      bonusRewardToken
      pool
      startTime
      endTime
      reward
      tier1Multiplier
      tier2Multiplier
      tier3Multiplier
      tokenAmountForTier1
      tokenAmountForTier2
      tokenAmountForTier3
      multiplierToken
      enterStartTime
      isDetached
      minRangeLength
    }
  }
`;

export const CURRENT_EVENTS = () => gql`
  query currentEvents($startTime: BigInt, $endTime: BigInt) {
    limitFarmings(
      orderBy: endTime
      orderDirection: desc
      where: {
        startTime_lte: $startTime
        endTime_gt: $endTime
        isDetached: false
      }
    ) {
      id
      rewardToken
      bonusReward
      bonusRewardToken
      pool
      startTime
      endTime
      reward
      tier1Multiplier
      tier2Multiplier
      tier3Multiplier
      tokenAmountForTier1
      tokenAmountForTier2
      tokenAmountForTier3
      enterStartTime
      multiplierToken
      isDetached
      minRangeLength
    }
  }
`;

export const FETCH_FINITE_FARM_FROM_POOL = (pools: string[]) => {
  let poolString = `[`;
  pools.map((address) => {
    return (poolString += `"${address}",`);
  });
  poolString += ']';
  const queryString = `
      query finiteFarmingsFromPools {
        limitFarmings(where: {pool_in: ${poolString}, isDetached: false, endTime_gt: ${Math.round(
    Date.now() / 1000,
  )}}) {
          id
          createdAtTimestamp
          rewardToken
          bonusReward
          bonusRewardToken
          pool
          startTime
          endTime
          reward
          multiplierToken
          tokenAmountForTier1
          tokenAmountForTier2
          tokenAmountForTier3
          tier1Multiplier
          tier2Multiplier
          tier3Multiplier
          enterStartTime
          isDetached
          minRangeLength
        }
      }
      `;
  return gql(queryString);
};

export const FROZEN_STAKED = () => gql`
  query frozenStaked($account: String, $timestamp: Int) {
    stakeTxes(
      where: { owner: $account, timestamp_gte: $timestamp }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      stakedALGBAmount
      xALGBAmount
    }
  }
`;

export const TRANSFERED_POSITIONS = (tierFarming: boolean) => gql`
    query transferedPositions ($account: Bytes) {
        deposits (orderBy: id, orderDirection: desc, where: {owner: $account, onFarmingCenter: true}) {
            id
            owner
            pool
            L2tokenId
            limitFarming
            eternalFarming
            onFarmingCenter
            rangeLength
            ${
              tierFarming
                ? `
              enteredInEternalFarming
              tokensLockedEternal
              tokensLockedLimit
              tierLimit
              tierEternal`
                : ''
            }
    }
}
`;

export const HAS_TRANSFERED_POSITIONS = () => gql`
  query hasTransferedPositions($account: Bytes) {
    deposits(first: 1, where: { owner: $account, onFarmingCenter: true }) {
      id
    }
  }
`;

export const POSITIONS_ON_ETERNAL_FARMING = () => gql`
  query positionsOnEternalFarming($account: Bytes) {
    deposits(
      orderBy: id
      orderDirection: desc
      where: {
        owner: $account
        onFarmingCenter: true
        eternalFarming_not: null
      }
    ) {
      id
      owner
      pool
      L2tokenId
      eternalFarming
      onFarmingCenter
      enteredInEternalFarming
    }
  }
`;

export const TRANSFERED_POSITIONS_FOR_POOL = () => gql`
  query transferedPositionsForPool(
    $account: Bytes
    $pool: Bytes
    $minRangeLength: BigInt
  ) {
    deposits(
      orderBy: id
      orderDirection: desc
      where: {
        owner: $account
        pool: $pool
        liquidity_not: "0"
        rangeLength_gte: $minRangeLength
      }
    ) {
      id
      owner
      pool
      L2tokenId
      limitFarming
      eternalFarming
      onFarmingCenter
      enteredInEternalFarming
      tokensLockedLimit
      tokensLockedEternal
      tierLimit
      tierEternal
    }
  }
`;

//Info

export const POSITIONS_ON_FARMING = () => gql`
  query positionsOnFarming($account: Bytes, $pool: Bytes) {
    deposits(
      orderBy: id
      orderDirection: desc
      where: { owner: $account, pool: $pool, onFarmingCenter: true }
    ) {
      id
    }
  }
`;

export const FULL_POSITIONS = (
  positions: string[],
  account: string | undefined,
  pool: string,
) => {
  const query = `
        query fullPositionsPriceRange {
            q1 : positions (where: {owner: "${account}", pool: "${pool}"})
            {
              owner
              liquidity
              id
              closed
              transaction {
                timestamp
              }
              tickLower {
                price0
                price1
              }
              tickUpper {
                price0
                price1
              }
              token0 {
                decimals
              }
              token1 {
                decimals
              }
              timestamps
            }

            q2: positions (where: {id_in: [${positions}] }) {
              owner
              liquidity
              id
              closed
              transaction {
                timestamp
              }
              tickLower {
                price0
                price1
              }
              tickUpper {
                price0
                price1
              }
               token0 {
                decimals
              }
              token1 {
                decimals
              }
              timestamps
            }
        }
    `;
  return gql(query);
};

export const INFINITE_EVENTS = gql`
  query infiniteFarms($detached: Boolean) {
    eternalFarmings(where: { isDetached: $detached }) {
      id
      rewardToken
      bonusRewardToken
      pool
      startTime
      endTime
      reward
      bonusReward
      rewardRate
      bonusRewardRate
      tokenAmountForTier1
      tokenAmountForTier2
      tokenAmountForTier3
      tier1Multiplier
      tier2Multiplier
      tier3Multiplier
      multiplierToken
      minRangeLength
      isDetached
    }
  }
`;

export const TOP_POOLS = gql`
  query topPools {
    pools(
      first: 50
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
  }
`;

export const POOLS_FROM_ADDRESSES = (
  blockNumber: undefined | number,
  pools: string[],
) => {
  let poolString = `[`;
  pools.map((address) => {
    return (poolString += `"${address}",`);
  });
  poolString += ']';
  const queryString =
    `
      query pools {
        pools(where: {id_in: ${poolString}},` +
    (blockNumber ? `block: {number: ${blockNumber}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
          id
          fee
          liquidity
          sqrtPrice
          tick
          token0 {
              id
              symbol
              name
              decimals
              derivedMatic
          }
          token1 {
              id
              symbol
              name
              decimals
              derivedMatic
          }
          token0Price
          token1Price
          volumeUSD
          txCount
          totalValueLockedToken0
          totalValueLockedToken1
          totalValueLockedUSD
          totalValueLockedUSDUntracked
          untrackedVolumeUSD
          feesUSD
        }
      }
      `;
  return gql(queryString);
};

export const TOP_TOKENS = gql`
  query topTokens {
    tokens(
      first: 50
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
  }
`;

export const TOKENS_FROM_ADDRESSES = (
  blockNumber: number | undefined,
  tokens: string[],
) => {
  let tokenString = `[`;
  tokens.map((address) => {
    return (tokenString += `"${address}",`);
  });
  tokenString += ']';
  const queryString =
    `
      query tokens {
        tokens(where: {id_in: ${tokenString}},` +
    (blockNumber ? `block: {number: ${blockNumber}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
          id
          symbol
          name
          derivedMatic
          volumeUSD
          volume
          txCount
          totalValueLocked
          untrackedVolumeUSD
          feesUSD
          totalValueLockedUSD
          totalValueLockedUSDUntracked
        }
      }
      `;

  return gql(queryString);
};

export const GET_STAKE = () => gql`
  query stakeHistory($id: ID) {
    factories {
      currentStakedAmount
      earnedForAllTime
      ALGBbalance
      xALGBtotalSupply
    }
    stakes(where: { id: $id }) {
      stakedALGBAmount
      xALGBAmount
    }
  }
`;

export const GET_STAKE_HISTORY = () => gql`
  query stake {
    histories(first: 1000, where: { date_gte: 1642626000 }) {
      date
      currentStakedAmount
      ALGBbalance
      xALGBminted
      xALGBburned
      xALGBtotalSupply
      ALGBfromVault
    }
  }
`;

//Blocklytics

export const GET_BLOCKS = (timestamps: string[]) => {
  let queryString = 'query blocks {';
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${timestamp +
      600} }) {
          number
        }`;
  });
  queryString += '}';
  return gql(queryString);
};

//Ticks

export const FETCH_TICKS = () => gql`
  query surroundingTicks(
    $poolAddress: String!
    $tickIdxLowerBound: BigInt!
    $tickIdxUpperBound: BigInt!
    $skip: Int!
  ) {
    ticks(
      subgraphError: allow
      first: 1000
      skip: $skip
      where: {
        poolAddress: $poolAddress
        tickIdx_lte: $tickIdxUpperBound
        tickIdx_gte: $tickIdxLowerBound
      }
    ) {
      tickIdx
      liquidityGross
      liquidityNet
      price0
      price1
    }
  }
`;

//Add Liquidity

export const FETCH_POPULAR_POOLS = () => gql`
  query popularPools {
    pools(orderBy: totalValueLockedUSD, orderDirection: desc, first: 6) {
      token0 {
        id
      }
      token1 {
        id
      }
    }
  }
`;
