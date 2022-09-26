import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ChainId } from '@uniswap/sdk';

export const clientV2: { [chainId: number]: any } = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const clientV3: { [chainId: number]: any } = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_2000_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const farmingClient: { [chainId: number]: any } = {
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
};

export const txClient: { [chainId: number]: any } = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const blockClient: { [chainId: number]: any } = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_2000_BLOCK_CLIENT_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};
