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
