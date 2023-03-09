import { Contract } from '@ethersproject/contracts';
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json';
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json';
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json';
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json';
import { ChainId, WETH } from '@uniswap/sdk';
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { useMemo } from 'react';
import { GlobalConst } from '../constants';
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS,
} from 'constants/abis/argent-wallet-detector';
import ENS_PUBLIC_RESOLVER_ABI from 'constants/abis/ens-public-resolver.json';
import ENS_ABI from 'constants/abis/ens-registrar.json';
import EIP_2612 from 'constants/abis/v3/eip_2612.json';
import ERC20_ABI, { ERC20_BYTES32_ABI } from 'constants/abis/erc20';
import V2ToV3MigratorABI from 'constants/abis/v3/migrator.json';
import { STAKING_DUAL_REWARDS_INTERFACE } from 'constants/abis/staking-rewards';
import UNISOCKS_ABI from 'constants/abis/unisocks.json';
import WETH_ABI from 'constants/abis/weth.json';
import { MULTICALL_ABI, MULTICALL_NETWORKS } from 'constants/multicall';
import {
  V1_EXCHANGE_ABI,
  V1_FACTORY_ABI,
  V1_FACTORY_ADDRESSES,
} from 'constants/v1';
import { getContract } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { abi as LairABI } from 'abis/DragonLair.json';
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import QUICKConversionABI from 'constants/abis/quick-conversion.json';
import {
  GAMMA_MASTERCHEF_ADDRESSES,
  GAMMA_UNIPROXY_ADDRESSES,
  MULTICALL_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  V3_MIGRATOR_ADDRESSES,
} from 'constants/v3/addresses';
import NewQuoterABI from 'constants/abis/v3/quoter.json';
import MULTICALL2_ABI from 'constants/abis/v3/multicall.json';
import NFTPosMan from 'constants/abis/v3/nft-pos-man.json';
import GammaUniProxy from 'constants/abis/gamma-uniproxy.json';
import GammaMasterChef from 'constants/abis/gamma-masterchef.json';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';

export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
): T | null {
  const { library, account, chainId } = useActiveWeb3React();

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !library || !chainId) return null;
    let address: string | undefined;
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap;
    else address = addressOrAddressMap[chainId];
    if (!address) return null;
    try {
      return getContract(
        address,
        ABI,
        library,
        withSignerIfPossible && account ? account : undefined,
      );
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [
    addressOrAddressMap,
    ABI,
    library,
    chainId,
    withSignerIfPossible,
    account,
  ]) as T;
}

export function useLairContract(): Contract | null {
  return useContract(GlobalConst.addresses.LAIR_ADDRESS, LairABI, true);
}

export function useQUICKContract(): Contract | null {
  return useContract(GlobalConst.addresses.QUICK_ADDRESS, ERC20_ABI, true);
}

export function useNewLairContract(): Contract | null {
  return useContract(GlobalConst.addresses.NEW_LAIR_ADDRESS, LairABI, true);
}

export function useNewQUICKContract(): Contract | null {
  return useContract(GlobalConst.addresses.NEW_QUICK_ADDRESS, ERC20_ABI, true);
}

export function useQUICKConversionContract(): Contract | null {
  return useContract(
    GlobalConst.addresses.QUICK_CONVERSION,
    QUICKConversionABI,
    true,
  );
}

export function useV1FactoryContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId && V1_FACTORY_ADDRESSES[chainId],
    V1_FACTORY_ABI,
    false,
  );
}

export function useV2ToV3MigratorContract() {
  return useContract(V3_MIGRATOR_ADDRESSES, V2ToV3MigratorABI, true);
}

export function useV1ExchangeContract(
  address?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(address, V1_EXCHANGE_ABI, withSignerIfPossible);
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible);
}

export function useWETHContract(
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId ? WETH[chainId].address : undefined,
    WETH_ABI,
    withSignerIfPossible,
  );
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId === ChainId.MATIC
      ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
      : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false,
  );
}

export function useENSRegistrarContract(
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React();
  let address: string | undefined;
  if (chainId) {
    switch (chainId) {
      case ChainId.MATIC:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'; //TODO: MATIC
        break;
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible);
}

export function useENSResolverContract(
  address: string | undefined,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible);
}

export function useBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible);
}

export function usePairContract(
  pairAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(pairAddress, IUniswapV2PairABI, withSignerIfPossible);
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false);
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId && MULTICALL_NETWORKS[chainId],
    MULTICALL_ABI,
    false,
  );
}

export function useMulticall2Contract() {
  return useContract(MULTICALL_ADDRESS, MULTICALL2_ABI, false);
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId
      ? GlobalConst.addresses.MERKLE_DISTRIBUTOR_ADDRESS[chainId]
      : undefined,
    MERKLE_DISTRIBUTOR_ABI,
    true,
  );
}

export function useGovernanceContract(): Contract | null {
  return useContract(
    GlobalConst.addresses.GOVERNANCE_ADDRESS,
    GOVERNANCE_ABI,
    true,
  );
}

export function useStakingContract(
  stakingAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible);
}

export function useDualRewardsStakingContract(
  stakingAddress?: string,
  withSignerIfPossible?: boolean,
): Contract | null {
  return useContract(
    stakingAddress,
    STAKING_DUAL_REWARDS_INTERFACE,
    withSignerIfPossible,
  );
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId === ChainId.MATIC ? undefined : undefined,
    UNISOCKS_ABI,
    false,
  );
}

export function useRouterContract(): Contract | null {
  const { chainId, account } = useActiveWeb3React();
  return useContract(
    chainId ? GlobalConst.addresses.ROUTER_ADDRESS[chainId] : undefined,
    IUniswapV2Router02ABI,
    Boolean(account),
  );
}

export function useV3Quoter() {
  return useContract(QUOTER_ADDRESSES, NewQuoterABI);
}

export function useV3NFTPositionManagerContract(
  withSignerIfPossible?: boolean,
) {
  return useContract(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    NFTPosMan,
    withSignerIfPossible,
  );
}

export function useGammaUNIProxyContract(withSignerIfPossible?: boolean) {
  return useContract(
    GAMMA_UNIPROXY_ADDRESSES,
    GammaUniProxy,
    withSignerIfPossible,
  );
}

export function useMasterChefContract(withSignerIfPossible?: boolean) {
  return useContract(
    GAMMA_MASTERCHEF_ADDRESSES,
    GammaMasterChef,
    withSignerIfPossible,
  );
}

export function useGammaHypervisorContract(
  address: string,
  withSignerIfPossible?: boolean,
) {
  return useContract(address, GammaPairABI, withSignerIfPossible);
}
