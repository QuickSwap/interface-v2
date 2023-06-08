import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ChainId } from '@uniswap/sdk';

export type ApolloChainMap = Readonly<
  {
    [chainId in ChainId]: ApolloClient<NormalizedCacheObject> | undefined;
  }
>;

export const clientV3: ApolloChainMap = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.MUMBAI]: undefined,
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_2000_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOEGCHAIN_TESTNET]: undefined,
  [ChainId.ZKTESTNET]: undefined,
  [ChainId.ZKEVM]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_1101_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const farmingClient: ApolloChainMap = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_V3_FARMING_API_137_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_V3_FARMING_API_2000_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.MUMBAI]: undefined,
  [ChainId.DOEGCHAIN_TESTNET]: undefined,
  [ChainId.ZKTESTNET]: undefined,
  [ChainId.ZKEVM]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_V3_FARMING_API_1101_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const blockClient: ApolloChainMap = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_137_BLOCK_CLIENT_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_2000_BLOCK_CLIENT_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.ZKEVM]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_1101_BLOCK_CLIENT_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.MUMBAI]: undefined,
  [ChainId.DOEGCHAIN_TESTNET]: undefined,
  [ChainId.ZKTESTNET]: undefined,
};

export const lensClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_LENS_API_URL,
  }),
  cache: new InMemoryCache(),
});
