import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export const clientV2 = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_V2_API_URL,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const clientV3 = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_V3_API_URL,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const farmingClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_V3_FARMING_API_URL,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const txClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_TX_GRAPH_API_URL,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_V2_API_URL,
  }),
  cache: new InMemoryCache(),
});

export const v3client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/iliaazhel/info-test',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const stakerClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/iliaazhel/staker',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const farmingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/iliaazhel/farming-test',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const oldFarmingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/iliaazhel/algebra-farming-t',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});
