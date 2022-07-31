import gql from 'graphql-tag';

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
