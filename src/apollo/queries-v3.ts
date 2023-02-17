import { GlobalConst } from 'constants/index';
import gql from 'graphql-tag';

//Global

export const GLOBAL_DATA_V3 = (block?: number) => {
  const qString = `
    query globalData {
      factories ${block ? `(block: { number: ${block} })` : ''} {
        totalVolumeUSD
        untrackedVolumeUSD
        totalValueLockedUSD
        totalValueLockedUSDUntracked
        totalFeesUSD
        txCount
        poolCount
      }
    }
  `;
  return gql(qString);
};

export const MATIC_PRICE_V3: any = (block?: number) => {
  const queryString = block
    ? `
    query bundles {
      bundles(where: { id: ${GlobalConst.utils.BUNDLE_ID} } block: {number: ${block}}) {
        id
        maticPriceUSD
      }
    }
  `
    : ` query bundles {
      bundles(where: { id: ${GlobalConst.utils.BUNDLE_ID} }) {
        id
        maticPriceUSD
      }
    }
  `;
  return gql(queryString);
};

export const GLOBAL_CHART_V3 = gql`
  query algebraDayDatas($startTime: Int!, $skip: Int!) {
    algebraDayDatas(
      first: 500
      skip: $skip
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      volumeUSD
      feesUSD
      tvlUSD
    }
  }
`;

//Tokens

export const TOP_TOKENS_V3 = (count: number) => gql`
  query topTokens {
    tokens(
      first: ${count}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
  }
`;

export const TOKENPRICES_FROM_ADDRESSES_V3 = (
  tokens: string[],
  blockNumber?: number,
) => {
  let tokenString = `[`;
  tokens.map((address) => {
    return (tokenString += `"${address}",`);
  });
  tokenString += ']';
  const queryString =
    `query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (blockNumber ? `block: {number: ${blockNumber}} ,` : ``) +
    `) {
            id
            derivedMatic
          }
        }
        `;

  return gql(queryString);
};

export const TOKENS_FROM_ADDRESSES_V3 = (
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
            decimals
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

export const ALL_TOKENS_V3 = gql`
  query tokens($skip: Int!) {
    tokens(first: 10, skip: $skip) {
      id
      name
      symbol
      decimals
      volumeUSD
      totalValueLockedUSD
    }
  }
`;

export const TOKEN_SEARCH_V3 = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(
      where: { symbol_contains_nocase: $value }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      volumeUSD
      totalValueLockedUSD
    }
    asName: tokens(
      where: { name_contains_nocase: $value }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      volumeUSD
      totalValueLockedUSD
    }
    asAddress: tokens(
      where: { id: $id }
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      volumeUSD
      totalValueLockedUSD
    }
  }
`;

export const TOKEN_INFO_OLD_V3: any = (block: number, address: string) => {
  const queryString = `
      query tokens {
        tokens(block: {number: ${block}} first: 1, where: {id: "${address}"}) {
            id
            name
            symbol
            decimals
            derivedMatic
            volumeUSD
            untrackedVolumeUSD
            totalValueLockedUSD
        }
      }
    `;
  return gql(queryString);
};

export const TOKEN_CHART_V3 = gql`
  query tokenDayDatas($tokenAddr: String!, $startTime: Int!) {
    tokenDayDatas(
      first: 1000
      orderBy: date
      orderDirection: desc
      where: { token: $tokenAddr, date_gt: $startTime }
    ) {
      id
      date
      priceUSD
      totalValueLocked
      totalValueLockedUSD
      volume
      volumeUSD
    }
  }
`;

export const IS_TOKEN_EXISTS_V3: any = (tokenAddress: string) => {
  const queryString = `
    query tokens {
      token(id: "${tokenAddress}"){
        id
      }
    }
  `;
  return gql(queryString);
};

//Pairs

export const TOP_POOLS_V3 = (count: number) => gql`
  query topPools {
    pools(
      first: ${count}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
  }
`;

export const TOP_POOLS_V3_TOKEN = (address: string) => gql`
  query topPools {
    pools0: pools(
      first: 100
      where: {token0_contains_nocase: "${address}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
    pools1: pools(
      first: 100
      where: {token1_contains_nocase: "${address}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
  }
`;

export const TOP_POOLS_V3_TOKENS = (address: string, address1: string) => gql`
  query topPools {
    pools0: pools(
      where: {token0_contains_nocase: "${address}", token1_contains_nocase: "${address1}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
    pools1: pools(
      first: 5
      where: {token0_contains_nocase: "${address}", token1_not_contains_nocase: "${address1}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
    pools2: pools(
      first: 5
      where: {token0_not_contains_nocase: "${address}", token1_contains_nocase: "${address1}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
    pools3: pools(
      first: 5
      where: {token0_contains_nocase: "${address1}", token1_not_contains_nocase: "${address}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
    pools4: pools(
      first: 5
      where: {token0_not_contains_nocase: "${address1}", token1_contains_nocase: "${address}"}
      orderBy: totalValueLockedUSD
      orderDirection: desc
      subgraphError: allow
    ) {
      id
    }
  }
`;

export const PAIRS_FROM_ADDRESSES_V3 = (
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

export const ALL_PAIRS_V3 = gql`
  query pairs($skip: Int!) {
    pools(
      first: 10
      skip: $skip
      orderBy: totalValueLockedUSD
      orderDirection: desc
    ) {
      id
      totalValueLockedUSD
      token0 {
        id
        symbol
        name
        decimals
      }
      token1 {
        id
        symbol
        name
        decimals
      }
    }
  }
`;

export const PAIR_SEARCH_V3 = gql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pools(where: { token0_in: $tokens }) {
      id
      totalValueLockedUSD
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
    as1: pools(where: { token1_in: $tokens }) {
      id
      totalValueLockedUSD
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
    asAddress: pools(where: { id: $id }) {
      id
      totalValueLockedUSD
      token0 {
        id
        symbol
        decimals
        name
      }
      token1 {
        id
        symbol
        decimals
        name
      }
    }
  }
`;

export const PAIR_CHART_V3 = gql`
  query pairDayDatasV3($pairAddress: Bytes!, $skip: Int!, $startTime: Int!) {
    poolDayDatas(
      first: 1000
      skip: $skip
      orderBy: date
      orderDirection: asc
      where: { pool: $pairAddress, date_gt: $startTime }
    ) {
      id
      date
      tvlUSD
      volumeUSD
      volumeToken0
      volumeToken1
      token0Price
      token1Price
      feesUSD
    }
  }
`;

export const PAIR_FEE_CHART_V3 = gql`
  query feeHourData($address: String, $skip: Int!, $startTime: Int!) {
    feeHourDatas(
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: asc
      where: { pool: $address, timestamp_gt: $startTime }
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

export const IS_PAIR_EXISTS_V3: any = (pairAddress: string) => {
  const queryString = `
    query pools {
      pool(id: "${pairAddress}"){
        id
        token0 {
          id
        }
        token1 {
          id
        }
      }
    }
  `;
  return gql(queryString);
};

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

//Transactions

export const PAIR_TRANSACTIONS_v3 = gql`
  query transactions($address: Bytes!) {
    mints(
      first: 100
      orderBy: timestamp
      orderDirection: desc
      where: { pool: $address }
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      sender
      origin
      amount0
      amount1
      amountUSD
    }
    swaps(
      first: 100
      orderBy: timestamp
      orderDirection: desc
      where: { pool: $address }
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      amount0
      amount1
      amountUSD
    }
    burns(
      first: 100
      orderBy: timestamp
      orderDirection: desc
      where: { pool: $address }
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      amount0
      amount1
      amountUSD
    }
  }
`;

export const GLOBAL_TRANSACTIONS_V3 = gql`
  query transactions($address: Bytes!) {
    mintsAs0: mints(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token0: $address }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      sender
      origin
      amount0
      amount1
      amountUSD
    }
    mintsAs1: mints(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token0: $address }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      sender
      origin
      amount0
      amount1
      amountUSD
    }
    swapsAs0: swaps(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token0: $address }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      amount0
      amount1
      amountUSD
    }
    swapsAs1: swaps(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token1: $address }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      origin
      amount0
      amount1
      amountUSD
    }
    burnsAs0: burns(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token0: $address }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      amount0
      amount1
      amountUSD
    }
    burnsAs1: burns(
      first: 500
      orderBy: timestamp
      orderDirection: desc
      where: { token1: $address }
      subgraphError: allow
    ) {
      timestamp
      transaction {
        id
      }
      pool {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      owner
      amount0
      amount1
      amountUSD
    }
  }
`;

//Farming

export const FETCH_ETERNAL_FARM_FROM_POOL_V3 = (pools: string[]) => {
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
        }
      }
      `;
  return gql(queryString);
};

export const PRICES_BY_BLOCK_V3: any = (
  tokenAddress: string,
  blocks: any[],
) => {
  let queryString = 'query blocks {';
  queryString += blocks.map(
    (block) => `
      t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) { 
        derivedMatic
      }
    `,
  );
  queryString += ',';
  queryString += blocks.map(
    (block) => `
      b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) { 
        maticPriceUSD
      }
    `,
  );

  queryString += '}';
  return gql(queryString);
};
