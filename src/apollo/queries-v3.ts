import gql from 'graphql-tag';

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
