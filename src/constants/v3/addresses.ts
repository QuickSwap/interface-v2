import { ChainId } from '@uniswap/sdk';
import { Token } from '@uniswap/sdk-core';
import { Matic } from 'v3lib/entities/matic';
import { WMATIC } from 'v3lib/entities/wmatic';

// {
//   x"poolDeployer": "0x2D98E2FA9da15aa6dC9581AB097Ced7af697CB92",
//   x"factory": "0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28",
//   "tickLens": "0x5e9793f398c68A55F9C85A965CdB0d0c9a094d70",
//   x"quoter": "0xa15F0D7377B2A0C0c10db057f641beD21028FC89",
//   x"swapRouter": "0xf5b509bB0909a69B1c207E495f687a596C168E12",
//   "nonfungibleTokenPositionDescriptor": "0x557E54e1e7a0D93f99e9D80E6d19e4843f452A2D",
//   x"nonfungiblePositionManager": "0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6",
//   x"v3Migrator": "0x157B9913E00204f8c980bb00aa62E22b0dAb1a63",
//   x"algebraInterfaceMulticall": "0x6ccb9426CeceE2903FbD97fd833fD1D31c100292",
//   x"algebraLimitFarming": "0x9923f42a02A82dA63EE0DbbC5f8E311e3DD8A1f8",
//   x"algebraEternalFarming": "0x8a26436e41d0b5fc4C6Ed36C1976fafBe173444E",
//   "farmingCenterVault": "0x347E0544b7ac8656c8727F4Ee8e2b7E644b85c17",
//   "farmingCenter": "0x7F281A8cdF66eF5e9db8434Ec6D97acc1bc01E78"
// }

type AddressMap = { [chainId: number]: string };

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28',
};

export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x2D98E2FA9da15aa6dC9581AB097Ced7af697CB92',
};

export const QUOTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xa15F0D7377B2A0C0c10db057f641beD21028FC89',
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xf5b509bB0909a69B1c207E495f687a596C168E12',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6',
};

export const MULTICALL_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x6ccb9426CeceE2903FbD97fd833fD1D31c100292',
};

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x157B9913E00204f8c980bb00aa62E22b0dAb1a63',
};

export const REAL_STAKER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
};

export const FINITE_FARMING: AddressMap = {
  [ChainId.MATIC]: '0x9923f42a02A82dA63EE0DbbC5f8E311e3DD8A1f8',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x8a26436e41d0b5fc4C6Ed36C1976fafBe173444E',
};

export const FARMING_CENTER: AddressMap = {
  [ChainId.MATIC]: '0x7F281A8cdF66eF5e9db8434Ec6D97acc1bc01E78',
};

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
};

export const V2_ROUTER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
};

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x65770b5283117639760beA3F867b69b3697a91dd',
};

export const WMATIC_EXTENDED: { [chainId: number]: Token } = {
  ...WMATIC,
};

export class ExtendedEther extends Matic {
  private static _cachedEther: { [chainId: number]: ExtendedEther } = {};

  public get wrapped(): Token {
    if (this.chainId in WMATIC_EXTENDED) return WMATIC_EXTENDED[this.chainId];
    throw new Error('Unsupported chain ID');
  }

  public static onChain(chainId: number): ExtendedEther {
    return (
      this._cachedEther[chainId] ??
      (this._cachedEther[chainId] = new ExtendedEther(chainId))
    );
  }
}
