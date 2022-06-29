import { ApolloClient } from 'apollo-client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { blockClient, client, farmingClient, stakerClient, oldFarmingClient } from '../../apollo/client'
import { useActiveWeb3React } from 'hooks'
import { ChainId } from '@uniswap/sdk';

export function useBlockClient(): ApolloClient<NormalizedCacheObject> {
    const { chainId } = useActiveWeb3React()
    switch (chainId) {
        case ChainId.MATIC:
            return blockClient
        default:
            return blockClient
    }
}

export function useDataClient(): ApolloClient<NormalizedCacheObject> {
    const { chainId } = useActiveWeb3React()
    switch (chainId) {
        case ChainId.MATIC:
            return client
        default:
            return client
    }
}

export function useFarmingClient(): ApolloClient<NormalizedCacheObject> {
    const { chainId } = useActiveWeb3React()
    switch (chainId) {
        case ChainId.MATIC:
            return farmingClient
        default:
            return farmingClient
    }
}

export function useOldFarmingClient(): ApolloClient<NormalizedCacheObject> {
    const { chainId } = useActiveWeb3React()
    switch (chainId) {
        case ChainId.MATIC:
            return oldFarmingClient
        default:
            return oldFarmingClient
    }
}

export function useStakingClient(): ApolloClient<NormalizedCacheObject> {
    const { chainId } = useActiveWeb3React()
    switch (chainId) {
        case ChainId.MATIC:
            return stakerClient
        default:
            return stakerClient
    }
}


export function useClients(): {
    dataClient: ApolloClient<NormalizedCacheObject>
    farmingClient: ApolloClient<NormalizedCacheObject>
    oldFarmingClient: ApolloClient<NormalizedCacheObject>
    blockClient: ApolloClient<NormalizedCacheObject>
    stakingClient: ApolloClient<NormalizedCacheObject>
} {
    const dataClient = useDataClient()
    const farmingClient = useFarmingClient()
    const oldFarmingClient = useOldFarmingClient()
    const blockClient = useBlockClient()
    const stakingClient = useStakingClient()

    return {
        dataClient,
        farmingClient,
        oldFarmingClient,
        blockClient,
        stakingClient
    }
}
