import { Contract } from '@ethersproject/contracts'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json'
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { ChainId, WETH } from '@uniswap/sdk'
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { useMemo } from 'react'
import { GOVERNANCE_ADDRESS, MERKLE_DISTRIBUTOR_ADDRESS, UNI, LAIR_ADDRESS, QUICK_ADDRESS } from '../constants'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from 'constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from 'constants/abis/ens-public-resolver.json'
import ENS_ABI from 'constants/abis/ens-registrar.json'
import ERC20_ABI, { ERC20_BYTES32_ABI } from 'constants/abis/erc20'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from 'constants/abis/migrator'
import UNISOCKS_ABI from 'constants/abis/unisocks.json'
import WETH_ABI from 'constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from 'constants/multicall'
import { V1_EXCHANGE_ABI, V1_FACTORY_ABI, V1_FACTORY_ADDRESSES } from 'constants/v1'
import { getContract } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { Web3Provider } from '@ethersproject/providers'
import { abi as LairABI } from 'abis/DragonLair.json'; 
const Web3HttpProvider = require('web3-providers-http');

const providers = new Array();
const sProviders = new Array();

const rpcUrls = [
  //"https://nd-995-891-194.p2pify.com/58d3a2349fd1d7d909ee1a51d76cfdbf",
  "https://matic-mainnet--jsonrpc.datahub.figment.io/apikey/73088fa3ab15c735a4efb389a05ebdfc/",
  "https://rpc-quickswap-do1-mainnet.maticvigil.com/v1/f11d33ea6df187c24fe994283187a4bedb086d45",
  "https://matic-mainnet--jsonrpc.datahub.figment.io/apikey/73088fa3ab15c735a4efb389a05ebdfc/",
  //"https://rpc-quickswap-mainnet.maticvigil.com/v1/f11d33ea6df187c24fe994283187a4bedb086d45",
  "https://nd-995-891-194.p2pify.com/58d3a2349fd1d7d909ee1a51d76cfdbf",
  "https://matic-mainnet.chainstacklabs.com",
  "https://shy-black-meadow.matic.quiknode.pro/aa57c5692641e98d1002a9dfeea7eb6438aa7937/",
  "https://nd-995-891-194.p2pify.com/58d3a2349fd1d7d909ee1a51d76cfdbf",
  "https://polygon-mainnet.g.alchemy.com/v2/jcLAFnx-j2TVrDjgVOGD8zUybSUL222R"
  //"https://rpc-mainnet.matic.network",
  //"https://quick.slingshot.finance"
  
]

const sRpcs = [
  "https://polygon-mainnet.g.alchemy.com/v2/jcLAFnx-j2TVrDjgVOGD8zUybSUL222R"
]

var lastUsedUrl = -1;
var maxUrls = 7

var sLastUsedUrl = -1;
const sMaxUrls = -1;
const sThreshold = 0;
var count = 0;

for (var i = 0; i < rpcUrls.length; i++) {
  const web3Provider = new Web3HttpProvider(rpcUrls[i]);
  providers.push(new Web3Provider(web3Provider));
}

for (var j = 0; j < sRpcs.length; j++) {
  const web3Provider = new Web3HttpProvider(sRpcs[j]);
  sProviders.push(new Web3Provider(web3Provider));
}


// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  var { library, account, chainId } = useActiveWeb3React()
  var provider:any = undefined;

  if (chainId && MULTICALL_NETWORKS[chainId] === address) {
    count = count + 1;
    if (sThreshold > 0 && count % sThreshold == 0) {
      console.log(count);
      if(sLastUsedUrl === sMaxUrls) {
        sLastUsedUrl = -1;
      }

      provider = sProviders[++sLastUsedUrl];
    }
    
    else {
      if(lastUsedUrl === maxUrls) {
        lastUsedUrl = -1;
      }
      provider = providers[++lastUsedUrl];
    }
  }
  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, provider !== undefined ? provider : library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useLairContract(): Contract | null {
  return useContract(LAIR_ADDRESS, LairABI, true)
}

export function useQUICKContract(): Contract | null {
  return useContract(QUICK_ADDRESS, ERC20_ABI, true)
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && V1_FACTORY_ADDRESSES[chainId], V1_FACTORY_ABI, false)
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useV1ExchangeContract(address?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MATIC ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MATIC:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'//TODO: MATIC
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, true)
}

export function useUniContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? UNI[chainId].address : undefined, UNI_ABI, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MATIC ? undefined : undefined,
    UNISOCKS_ABI,
    false
  )
}
