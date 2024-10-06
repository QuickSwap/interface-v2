import { Contract } from '@ethersproject/contracts';
import abi from '@uniswap/liquidity-staker/build/StakingRewards.json';
import { ChainId, WETH } from '@uniswap/sdk';
import iUniswapV2Pair from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { useMemo } from 'react';
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
import NATIVE_CONVERTER_ABI from 'constants/abis/nativeConverter.json';
import { MULTICALL_ABI } from 'constants/multicall';
import {
  V1_EXCHANGE_ABI,
  V1_FACTORY_ABI,
  V1_FACTORY_ADDRESSES,
} from 'constants/v1';
import { getContract } from 'utils';
import { useActiveWeb3React } from 'hooks';
import dragonsLair from 'abis/DragonLair.json';
import router02 from '@uniswap/v2-periphery/build/IUniswapV2Router02.json';
import QUICKConversionABI from 'constants/abis/quick-conversion.json';
import {
  GAMMA_MASTERCHEF_ADDRESSES,
  MULTICALL_ADDRESS,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  V3_MIGRATOR_ADDRESSES,
  MULTICALL_NETWORKS,
  V2_ROUTER_ADDRESS,
  LAIR_ADDRESS,
  QUICK_ADDRESS,
  NEW_LAIR_ADDRESS,
  QUICK_CONVERSION,
  DL_QUICK_ADDRESS,
  ZAP_ADDRESS,
  UNI_NFT_POSITION_MANAGER_ADDRESS,
  UNIV3_QUOTER_ADDRESSES,
  STEER_PERIPHERY,
  STEER_VAULT_REGISTRY,
  PRICE_GETTER_ADDRESS,
  MERKL_DISTRIBUTOR,
  NATIVE_CONVERTER,
} from 'constants/v3/addresses';
import NewQuoterABI from 'constants/abis/v3/quoter.json';
import UniV3QuoterABI from 'constants/abis/uni-v3/quoter.json';
import MULTICALL2_ABI from 'constants/abis/v3/multicall.json';
import NFTPosMan from 'constants/abis/v3/nft-pos-man.json';
import GammaUniProxy1 from 'constants/abis/gamma-uniproxy1.json';
import GammaMasterChef from 'constants/abis/gamma-masterchef.json';
import GammaPairABI from 'constants/abis/gamma-hypervisor.json';
import TokenLockerABI from 'constants/abis/token-locker-abi.json';
import UNINFTPosMan from 'constants/abis/uni-v3/nft-position-manager.json';
import { useSingleCallResult } from 'state/multicall/v3/hooks';
import UNIPILOT_VAULT_ABI from 'constants/abis/unipilot-vault.json';
import UNIPILOT_SINGLE_REWARD_ABI from 'constants/abis/unipilot-single-reward.json';
import UNIPILOT_DUAL_REWARD_ABI from 'constants/abis/unipilot-dual-reward.json';
import DEFIEDGE_STRATEGY_ABI from 'constants/abis/defiedge-strategy.json';
import DEFIEDGE_MINICHEF_ABI from 'constants/abis/defiedge-minichef.json';
import PRICE_GETTER_ABI from 'constants/abis/price-getter.json';
import BOND_ABI from 'constants/abis/bond.json';
import BOND_NFT_ABI from 'constants/abis/bondNFT.json';
import ZAP_ABI from 'constants/abis/zap.json';
import STEER_STAKING_ABI from 'constants/abis/steer-staking.json';
import STEER_DUAL_STAKING_ABI from 'constants/abis/steer-staking-dual.json';
import SteerPeripheryABI from 'constants/abis/steer-periphery.json';
import SteerVaultABI from 'constants/abis/steer-vault.json';
import SteerVaultRegistryABI from 'constants/abis/steer-vault-registry.json';
import { V2_FACTORY_ADDRESSES } from 'constants/lockers';
import { RPC_PROVIDERS } from 'constants/providers';

const LairABI = dragonsLair.abi;
const IUniswapV2Router02ABI = router02.abi;
const IUniswapV2PairABI = iUniswapV2Pair.abi;

const STAKING_REWARDS_ABI = abi.abi;
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
): T | null {
  const { library: web3ModalLibrary, account, chainId } = useActiveWeb3React();
  const libraryFromChain = RPC_PROVIDERS[chainId];
  const library = web3ModalLibrary ?? libraryFromChain;

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

export function useContracts<T extends Contract = Contract>(
  addressOrAddressMaps: string[] | { [chainId: number]: string }[] | undefined,
  ABI: any,
  withSignerIfPossible = true,
): (T | null)[] {
  const { library, account, chainId } = useActiveWeb3React();

  return useMemo(() => {
    if (!addressOrAddressMaps || !ABI || !library || !chainId) return [];
    return addressOrAddressMaps.map((addressOrAddressMap) => {
      let address: string | undefined;
      if (typeof addressOrAddressMap === 'string')
        address = addressOrAddressMap;
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
    });
  }, [
    addressOrAddressMaps,
    ABI,
    library,
    chainId,
    withSignerIfPossible,
    account,
  ]) as (T | null)[];
}

export function useTokenLockerContract(
  chainId: ChainId,
  lockContractAddress?: string,
  withSignerIfPossible = true,
): Contract | null {
  return useContract(
    lockContractAddress ?? V2_FACTORY_ADDRESSES[chainId],
    TokenLockerABI,
    withSignerIfPossible,
  );
}

export function useLairContract(chainId?: ChainId): Contract | null {
  return useContract(
    chainId ? LAIR_ADDRESS[chainId] : LAIR_ADDRESS,
    LairABI,
    true,
  );
}

export function useQUICKContract(): Contract | null {
  return useContract(QUICK_ADDRESS, ERC20_ABI, true);
}

export function useNewLairContract(): Contract | null {
  return useContract(NEW_LAIR_ADDRESS, LairABI, true);
}

export function useNewQUICKContract(): Contract | null {
  return useContract(DL_QUICK_ADDRESS, ERC20_ABI, true);
}

export function useQUICKConversionContract(): Contract | null {
  return useContract(QUICK_CONVERSION, QUICKConversionABI, true);
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

export function useNativeConverterContract(
  withSignerIfPossible?: boolean,
): Contract | null {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId ? NATIVE_CONVERTER[chainId] : undefined,
    NATIVE_CONVERTER_ABI,
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
    chainId ? V2_ROUTER_ADDRESS[chainId] : undefined,
    IUniswapV2Router02ABI,
    Boolean(account),
  );
}

export function useV3Quoter() {
  return useContract(QUOTER_ADDRESSES, NewQuoterABI);
}
export function useUniV3Quoter() {
  return useContract(UNIV3_QUOTER_ADDRESSES, UniV3QuoterABI);
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

export function useUNIV3NFTPositionManagerContract(
  withSignerIfPossible?: boolean,
) {
  return useContract(
    UNI_NFT_POSITION_MANAGER_ADDRESS,
    UNINFTPosMan,
    withSignerIfPossible,
  );
}

export function useGammaUNIProxyContract(
  pairAddress?: string,
  withSignerIfPossible?: boolean,
) {
  const hypervisorContract = useGammaHypervisorContract(pairAddress);
  const uniProxyResult = useSingleCallResult(
    hypervisorContract,
    'whitelistedAddress',
  );
  const uniProxyAddress =
    !uniProxyResult.loading &&
    uniProxyResult.result &&
    uniProxyResult.result.length > 0
      ? uniProxyResult.result[0]
      : undefined;
  return useContract(uniProxyAddress, GammaUniProxy1, withSignerIfPossible);
}

export function useMasterChefContract(
  index?: number,
  withSignerIfPossible?: boolean,
  abi?: any,
) {
  return useContract(
    GAMMA_MASTERCHEF_ADDRESSES[index ?? 0],
    abi ?? GammaMasterChef,
    withSignerIfPossible,
  );
}

export function useMiniChefContract(
  address?: string,
  withSignerIfPossible?: boolean,
) {
  return useContract(address, DEFIEDGE_MINICHEF_ABI, withSignerIfPossible);
}

export function useMasterChefContracts(withSignerIfPossible?: boolean) {
  return useContracts(
    GAMMA_MASTERCHEF_ADDRESSES,
    GammaMasterChef,
    withSignerIfPossible,
  );
}

export function useGammaHypervisorContract(
  address?: string,
  withSignerIfPossible?: boolean,
) {
  return useContract(address, GammaPairABI, withSignerIfPossible);
}

export function useUniPilotVaultContract(
  address?: string,
  withSignerIfPossible?: boolean,
) {
  return useContract(address, UNIPILOT_VAULT_ABI, withSignerIfPossible);
}

export function useDefiedgeStrategyContract(
  address?: string,
  withSignerIfPossible?: boolean,
) {
  return useContract(address, DEFIEDGE_STRATEGY_ABI, withSignerIfPossible);
}

export function useDefiEdgeMiniChefContracts(
  addresses: string[],
  withSignerIfPossible?: boolean,
) {
  return useContracts(addresses, DEFIEDGE_MINICHEF_ABI, withSignerIfPossible);
}

export function useUnipilotFarmingContract(
  address?: string,
  isDual?: boolean,
  withSignerIfPossible?: boolean,
) {
  const singleContract = useContract(
    address,
    UNIPILOT_SINGLE_REWARD_ABI,
    withSignerIfPossible,
  );
  const dualContract = useContract(
    address,
    UNIPILOT_DUAL_REWARD_ABI,
    withSignerIfPossible,
  );
  return isDual ? dualContract : singleContract;
}

export function usePriceGetterContract(withSignerIfPossible?: boolean) {
  return useContract(
    PRICE_GETTER_ADDRESS,
    PRICE_GETTER_ABI,
    withSignerIfPossible,
  );
}

export const useBondContract = (address: string) => {
  return useContract(address, BOND_ABI);
};

export const useBondContracts = (addresses: string[]) => {
  return useContracts(addresses, BOND_ABI);
};

export const useBondNFTContract = (address: string) => {
  return useContract(address, BOND_NFT_ABI);
};

export function useZapContract(withSignerIfPossible?: boolean) {
  const { chainId } = useActiveWeb3React();
  return useContract(
    chainId ? ZAP_ADDRESS[chainId] : undefined,
    ZAP_ABI,
    withSignerIfPossible,
  );
}

export function useSteerPeripheryContract(withSignerIfPossible?: boolean) {
  const contract = useContract(
    STEER_PERIPHERY,
    SteerPeripheryABI,
    withSignerIfPossible,
  );
  return contract;
}

export function useSteerVaultRegistryContract(withSignerIfPossible?: boolean) {
  const contract = useContract(
    STEER_VAULT_REGISTRY,
    SteerVaultRegistryABI,
    withSignerIfPossible,
  );
  return contract;
}

export function useSteerVaultContract(
  address?: string,
  withSignerIfPossible?: boolean,
) {
  const contract = useContract(address, SteerVaultABI, withSignerIfPossible);
  return contract;
}

export function useSteerFarmingContract(
  address?: string,
  isDual?: boolean,
  withSignerIfPossible?: boolean,
) {
  const singleContract = useContract(
    address,
    STEER_STAKING_ABI,
    withSignerIfPossible,
  );
  const dualContract = useContract(
    address,
    STEER_DUAL_STAKING_ABI,
    withSignerIfPossible,
  );
  return isDual ? dualContract : singleContract;
}

export function useMerklContract(withSignerIfPossible?: boolean) {
  const distributorABI = [
    'function claim(address[] calldata users, address[] calldata tokens, uint256[] calldata amounts, bytes32[][] calldata proofs) external',
  ];
  const contract = useContract(
    MERKL_DISTRIBUTOR,
    distributorABI,
    withSignerIfPossible,
  );
  return contract;
}
