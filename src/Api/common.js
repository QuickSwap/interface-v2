import { ApolloClient, InMemoryCache } from "@apollo/client";

export const chainlinkClient = createClient(process.env.REACT_APP_PRICE_SUBGRAPH);

export const polygonGraphClient = createClient(process.env.REACT_APP_QPX_CORE_SUBGRAPH);

export const quickGraphClient = createClient(process.env.REACT_APP_GRAPH_QUICK_API_URL);

// All Positions
export const positionsGraphClient = createClient(process.env.REACT_APP_QPX_POSITIONS_SUBGRAPH);

export const polygonReferralsGraphClient = createClient(process.env.REACT_APP_QPX_REFERRAL_SUBGRAPH);


function createClient(uri) {
  return new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });
}
