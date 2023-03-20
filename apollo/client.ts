import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';

export const clientV2 = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPH_V2_API_URL,
  }),
  cache: new InMemoryCache(),
});

export const clientV3 = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPH_V3_API_URL,
  }),
  cache: new InMemoryCache(),
});

export const farmingClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_V3_FARMING_API_URL,
  }),
  cache: new InMemoryCache(),
});

export const txClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPH_V2_API_URL,
  }),
  cache: new InMemoryCache(),
});

export const blockClient = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPH_V2_API_URL,
  }),
  cache: new InMemoryCache(),
});
