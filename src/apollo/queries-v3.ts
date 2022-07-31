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

export const TOP_TOKENS_V3 = gql`
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
