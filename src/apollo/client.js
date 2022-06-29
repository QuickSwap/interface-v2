import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.REACT_APP_GRAPH_API_URL,
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
    uri: process.env.REACT_APP_GRAPH_API_URL,
  }),
  cache: new InMemoryCache(),
});

export const stakerClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/iliaazhel/staker',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
      watchQuery: {
          fetchPolicy: 'no-cache'
      },
      query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all'
      }
  }
})

export const farmingClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/cryptoalgebra/algebra-farming',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
      watchQuery: {
          fetchPolicy: 'no-cache'
      },
      query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all'
      }
  }
})

export const oldFarmingClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/iliaazhel/algebra-farming-t',
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
      watchQuery: {
          fetchPolicy: 'no-cache'
      },
      query: {
          fetchPolicy: 'no-cache',
          errorPolicy: 'all'
      }
  }
})

