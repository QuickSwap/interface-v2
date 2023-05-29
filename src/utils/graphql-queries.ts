import gql from 'graphql-tag';

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

export const INFINITE_EVENTS = gql`
  query infiniteFarms {
    eternalFarmings {
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
