import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { blockClient, farmingClient, clientV3 } from '../../apollo/client';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';

export function useBlockClient(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  return blockClient[chainIdToUse];
}

export function useV3Client(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  return clientV3[chainIdToUse];
}

export function useFarmingClient(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  return farmingClient[chainIdToUse];
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
