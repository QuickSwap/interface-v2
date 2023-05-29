import gql from 'graphql-tag';

export const TOKEN_SEARCH = gql`
  query tokens($value: String, $id: String) {
    asSymbol: tokens(
      where: { symbol_contains: $value }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
    asName: tokens(
      where: { name_contains: $value }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
    asAddress: tokens(
      where: { id: $id }
      orderBy: totalLiquidity
      orderDirection: desc
    ) {
      id
      symbol
      name
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
  }
`;

export const PAIR_SEARCH = gql`
  query pairs($tokens: [Bytes]!, $id: String) {
    as0: pairs(where: { token0_in: $tokens }) {
      id
      trackedReserveETH
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
    as1: pairs(where: { token1_in: $tokens }) {
      id
      trackedReserveETH
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
    asAddress: pairs(where: { id: $id }) {
      id
      trackedReserveETH
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

export const ALL_TOKENS = gql`
  query tokens($skip: Int!) {
    tokens(first: 10, skip: $skip) {
      id
      name
      symbol
      decimals
      tradeVolumeUSD
      totalLiquidity
    }
  }
`;

export const ALL_PAIRS = gql`
  query pairs($skip: Int!) {
    pairs(
      first: 10
      skip: $skip
      orderBy: trackedReserveETH
      orderDirection: desc
    ) {
      id
      trackedReserveETH
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

export const PAIRS_BULK1 = gql`
  ${PairFields}
  query pairs($allPairs: [Bytes]!) {
    pairs(
      first: 500
      where: { id_in: $allPairs }
      orderBy: trackedReserveETH
      orderDirection: desc
    ) {
      ...PairFields
    }
  }
`;

const TokenFields = `
  fragment TokenFields on Token {
    id
    name
    symbol
    decimals
    derivedETH
    tradeVolume
    tradeVolumeUSD
    untrackedVolumeUSD
    totalLiquidity
  }
`;

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

export const PAIR_ID: any = (tokenAddress0: string, tokenAddress1: string) => {
  const queryString = `
    query tokens {
      pairs0: pairs(where: {token0: "${tokenAddress0}", token1: "${tokenAddress1}"}){
        id
      }
      pairs1: pairs(where: {token0: "${tokenAddress1}", token1: "${tokenAddress0}"}){
        id
      }
    }
  `;
  return gql(queryString);
};

export const PAIR_DATA: any = (pairAddress: string, block?: number) => {
  const queryString = `
    ${PairFields}
    query pairs {
      pairs(${
        block ? `block: {number: ${block}}` : ``
      } where: { id: "${pairAddress}"} ) {
        ...PairFields
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

export const SWAP_TRANSACTIONS = gql`
  query($allPairs: [Bytes]!, $lastTime: Int!) {
    swaps(
      first: 1000
      where: { pair_in: $allPairs, timestamp_gte: $lastTime }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction {
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
      to
    }
  }
`;

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
