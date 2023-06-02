import gql from 'graphql-tag';

const PairFields = `
  fragment PairFields on Pair {
    id
    trackedReserveETH
    reserve0
    reserve1
    volumeUSD
    untrackedVolumeUSD
    reserveUSD
    totalSupply
    token0 {
      symbol
      id
      decimals
      derivedETH
    }
    token1 {
      symbol
      id
      decimals
      derivedETH
    }
  }
`;

export const PAIRS_BULK: any = (pairs: any[]) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair.toLowerCase()}"`);
  });
  pairsString += ']';
  const queryString = `
  ${PairFields}
  query pairs {
    pairs(first: ${pairs.length}, where: { id_in: ${pairsString} }, orderBy: trackedReserveETH, orderDirection: desc) {
      ...PairFields
    }
  }
  `;
  return gql(queryString);
};

export const TOKEN_PRICES_V2 = (tokens: string[], blockNumber?: number) => {
  let tokenString = `[`;
  tokens.map((address) => {
    return (tokenString += `"${address.toLowerCase()}",`);
  });
  tokenString += ']';
  const queryString =
    `query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (blockNumber ? `block: {number: ${blockNumber}} ,` : ``) +
    ` first: 1000) {
        id
        derivedETH
      }
    }`;

  return gql(queryString);
};

export const PAIRS_HISTORICAL_BULK: any = (block: number, pairs: any[]) => {
  let pairsString = `[`;
  pairs.map((pair) => {
    return (pairsString += `"${pair.toLowerCase()}"`);
  });
  pairsString += ']';
  const queryString = `
  query pairs {
    pairs(first: ${pairs.length}, where: {id_in: ${pairsString}}, block: {number: ${block}}, orderBy: trackedReserveETH, orderDirection: desc) {
      id
      reserveUSD
      trackedReserveETH
      volumeUSD
      untrackedVolumeUSD
      totalSupply
    }
  }
  `;
  return gql(queryString);
};

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

export const GET_BLOCKS: any = (timestamps: number[]) => {
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

export const GET_LENS_PROFILES = gql`
  query($ownedBy: [EthereumAddress!]) {
    profiles(request: { ownedBy: $ownedBy }) {
      items {
        name
        handle
        ownedBy
        bio
        id
      }
    }
  }
`;
