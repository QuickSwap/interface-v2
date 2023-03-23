import { ApolloClient } from 'apollo-client';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { ChainId } from '@uniswap/sdk';

export type ApolloChainMap = Readonly<
  {
    [chainId in ChainId]: ApolloClient<NormalizedCacheObject>;
  }
>;

export const clientV2: ApolloChainMap = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_2000_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOEGCHAIN_TESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_568_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.MUMBAI]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_80001_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.ZKTESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_1402_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const clientV3: ApolloChainMap = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.MUMBAI]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_80001_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_2000_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOEGCHAIN_TESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_568_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.ZKTESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V3_1402_API_URL,
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
  [ChainId.MUMBAI]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_V3_FARMING_API_80001_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOEGCHAIN_TESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_V3_FARMING_API_568_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.ZKTESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_V3_FARMING_API_1402_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const txClient: ApolloChainMap = {
  [ChainId.MATIC]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_137_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOGECHAIN]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_2000_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.MUMBAI]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_80001_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOEGCHAIN_TESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_568_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.ZKTESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_1402_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const blockClient: ApolloChainMap = {
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
  [ChainId.MUMBAI]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_V2_80001_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.DOEGCHAIN_TESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_568_BLOCK_CLIENT_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
  [ChainId.ZKTESTNET]: new ApolloClient({
    link: new HttpLink({
      uri: process.env.REACT_APP_GRAPH_1402_BLOCK_CLIENT_API_URL,
    }),
    cache: new InMemoryCache(),
  }),
};

export const lensClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_LENS_API_URL,
  }),
  cache: new InMemoryCache(),
});
