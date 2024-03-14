import { ChainId } from '@uniswap/sdk';

type AddressMap = { [chainId: number]: string };

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x3ef7442df454ba6b7c1deec8ddf29cfb2d6e56c7',
  [ChainId.MUMBAI]: '0x0891b3728ba802e5240ae3552749eb23093ed2d5',
};
