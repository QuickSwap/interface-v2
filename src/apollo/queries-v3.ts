import gql from 'graphql-tag';

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

//Pairs

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

export const SWAP_TRANSACTIONS_v3 = gql`
  query transactions($address: Bytes!, $lastTime: Int!) {
    swaps(
      first: 1000
      orderBy: timestamp
      orderDirection: desc
      where: { pool: $address, timestamp_gte: $lastTime }
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
      recipient
      amount0
      amount1
      amountUSD
    }
  }
`;

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

export const SWAP_TRANSACTIONS_V3 = gql`
  query(
    $pool_in: [String]!
    $timestamp_gte: Int!
    $timestamp_lte: Int!
    $skip: Int!
    $origin: String!
  ) {
    swaps(
      first: 1000
      skip: $skip
      where: {
        pool_in: $pool_in
        timestamp_gte: $timestamp_gte
        timestamp_lte: $timestamp_lte
        origin: $origin
      }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      origin
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      amountUSD
      amount0
      amount1
      sender
    }
  }
`;

export const PAIR_ID_V3 = (tokenAddress0: string, tokenAddress1: string) => {
  const queryString = `
    query pairs {
      pairs0: pools(where: {token0: "${tokenAddress0}", token1: "${tokenAddress1}"}){
        id
      }
      pairs1: pools(where: {token0: "${tokenAddress1}", token1: "${tokenAddress0}"}){
        id
      }
    }
  `;
  return gql(queryString);
};
