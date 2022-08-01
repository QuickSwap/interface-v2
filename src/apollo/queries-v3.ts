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
      }
    }
  `;
  return gql(qString);
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
      where: { symbol_contains: $value }
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
      where: { name_contains: $value }
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
