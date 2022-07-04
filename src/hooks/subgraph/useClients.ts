import { ApolloClient } from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import {
  blockClient,
  v3client,
  farmingClient,
  stakerClient,
  oldFarmingClient,
} from '../../apollo/client';
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
      return v3client;
    default:
      return v3client;
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

export function useOldFarmingClient(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  switch (chainId) {
    case ChainId.MATIC:
      return oldFarmingClient;
    default:
      return oldFarmingClient;
  }
}

export function useStakingClient(): ApolloClient<NormalizedCacheObject> {
  const { chainId } = useActiveWeb3React();
  switch (chainId) {
    case ChainId.MATIC:
      return stakerClient;
    default:
      return stakerClient;
  }
}

export function useClients(): {
  v3Client: ApolloClient<NormalizedCacheObject>;
  farmingClient: ApolloClient<NormalizedCacheObject>;
  oldFarmingClient: ApolloClient<NormalizedCacheObject>;
  blockClient: ApolloClient<NormalizedCacheObject>;
  stakingClient: ApolloClient<NormalizedCacheObject>;
} {
  const v3Client = useV3Client();
  const farmingClient = useFarmingClient();
  const oldFarmingClient = useOldFarmingClient();
  const blockClient = useBlockClient();
  const stakingClient = useStakingClient();

  return {
    v3Client,
    farmingClient,
    oldFarmingClient,
    blockClient,
    stakingClient,
  };
}
