import {
  BaseQueryApi,
  BaseQueryFn,
} from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { createApi } from '@reduxjs/toolkit/query/react';
import { ChainId } from '@uniswap/sdk';
import { DocumentNode } from 'graphql';
import { ClientError, gql, GraphQLClient } from 'graphql-request';
import { AppState } from 'state';

// List of supported subgraphs. Note that the app currently only support one active subgraph at a time
const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [ChainId.MATIC]: `${process.env.REACT_APP_GRAPH_V3_137_API_URL}`,
  [ChainId.DOGECHAIN]: `${process.env.REACT_APP_GRAPH_V3_2000_API_URL}`,
};

export const api = createApi({
  reducerPath: 'dataApi',
  baseQuery: graphqlRequestBaseQuery(),
  endpoints: (builder) => ({
    allV3Ticks: builder.query({
      query: ({ poolAddress, skip = 0 }) => ({
        document: gql`
          query allV3Ticks($poolAddress: String!, $skip: Int!) {
            ticks(
              first: 1000
              skip: $skip
              where: { poolAddress: $poolAddress }
              orderBy: tickIdx
            ) {
              tickIdx
              liquidityNet
              price0
              price1
            }
          }
        `,
        variables: {
          poolAddress,
          skip,
        },
      }),
    }),
    feeTierDistribution: builder.query({
      query: ({ token0, token1 }) => ({
        document: gql`
          query feeTierDistribution($token0: String!, $token1: String!) {
            _meta {
              block {
                number
              }
            }
            asToken0: pools(
              orderBy: totalValueLockedToken0
              orderDirection: desc
              where: { token0: $token0, token1: $token1 }
            ) {
              fee
              totalValueLockedToken0
              totalValueLockedToken1
            }
            asToken1: pools(
              orderBy: totalValueLockedToken0
              orderDirection: desc
              where: { token0: $token1, token1: $token0 }
            ) {
              fee
              totalValueLockedToken0
              totalValueLockedToken1
            }
          }
        `,
        variables: {
          token0,
          token1,
        },
      }),
    }),
  }),
});

// Graphql query client wrapper that builds a dynamic url based on chain id
function graphqlRequestBaseQuery(): BaseQueryFn<
  { document: string | DocumentNode; variables?: any },
  unknown,
  Pick<ClientError, 'name' | 'message' | 'stack'>,
  Partial<Pick<ClientError, 'request' | 'response'>>
> {
  return async ({ document, variables }, { getState }: BaseQueryApi) => {
    try {
      //TODO: Fix chainId to be grabbed from application state after ChainId is added To application
      // const chainId = (getState() as AppState).application?.chainId ?? ChainId.MATIC;
      const chainId = ChainId.MATIC;
      const subgraphUrl = chainId ? CHAIN_SUBGRAPH_URL[chainId] : undefined;

      if (!subgraphUrl) {
        return {
          error: {
            name: 'UnsupportedChainId',
            message: `Subgraph queries against ChainId ${chainId} are not supported.`,
            stack: '',
          },
        };
      }

      return {
        data: await new GraphQLClient(subgraphUrl).request(document, variables),
        meta: {},
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const { name, message, stack, request, response } = error;
        return { error: { name, message, stack }, meta: { request, response } };
      }
      throw error;
    }
  };
}
