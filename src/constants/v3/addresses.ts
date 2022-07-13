import { Token } from '@uniswap/sdk-core';
import { Matic } from 'v3lib/entities/matic';
import { WMATIC } from 'v3lib/entities/wmatic';
import { SupportedChainId } from './chains';

type AddressMap = { [chainId: number]: string };

export const V3_CORE_FACTORY_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x8C1EB1e5325049B412B7E71337116BEF88a29b3A',
};

export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON]: '0x218a510d4d6aEA897961ab6Deb74443521A88839',
};

export const QUOTER_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0xAaaCfe8F51B8baA4286ea97ddF145e946d5e7f46',
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x89D6B81A1Ef25894620D05ba843d83B0A296239e',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x21F5F8b46621cFa77D4f296A901cDB7AfDBB6A18',
};

export const MULTICALL_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON]: '0xFB8CcFDa4889C6D399B62EA49Cca3cE9d3fF077e',
};

export const V3_MIGRATOR_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x76716bc0ae7639191c479C2432aC1f271f13dBd9',
};

export const REAL_STAKER_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON]: '0x32CFF674763b06B983C0D55Ef2e41B84D16855bb',
};

export const FINITE_FARMING: AddressMap = {
  [SupportedChainId.POLYGON]: '0x88721ec14bb41078c65df5c85b85e50f77c04d79',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON]: '0x9e448afe97fc6bed274110e0e3a034cec55fbcb5',
};

export const FARMING_CENTER: AddressMap = {
  [SupportedChainId.POLYGON]: '0x7060ef7374a081f9a09dbcd3f5c38b2985299044',
};

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
};

export const V2_ROUTER_ADDRESS: AddressMap = {
  [SupportedChainId.POLYGON]: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
};

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
};

export const SOCKS_CONTROLLER_ADDRESSES: AddressMap = {
  [SupportedChainId.POLYGON]: '0x65770b5283117639760beA3F867b69b3697a91dd',
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
