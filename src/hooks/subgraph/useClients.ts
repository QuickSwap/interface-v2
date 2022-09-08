import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { blockClient, farmingClient, clientV3 } from '../../apollo/client';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

export function useBlockClient(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  switch (chainId) {
    case ChainId.MATIC:
      return blockClient;
    default:
      return blockClient;
  }
}

export function useV3Client(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  switch (chainId) {
    case ChainId.MATIC:
      return clientV3;
    default:
      return clientV3;
  }
}

export function useFarmingClient(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  switch (chainId) {
    case ChainId.MATIC:
      return farmingClient;
    default:
      return farmingClient;
  }
}

export function useClients(): {
  v3Client: ApolloClient<NormalizedCacheObject>;
  farmingClient: ApolloClient<NormalizedCacheObject>;
  blockClient: ApolloClient<NormalizedCacheObject>;
} {
  const v3Client = useV3Client();
  const farmingClient = useFarmingClient();
  const blockClient = useBlockClient();

  return {
    v3Client,
    farmingClient,
    blockClient,
  };
}
