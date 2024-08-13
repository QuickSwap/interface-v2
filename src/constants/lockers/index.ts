import { ChainId } from '@uniswap/sdk';

type AddressMap = { [chainId: number]: string };

export const V2_FACTORY_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x3ef7442df454ba6b7c1deec8ddf29cfb2d6e56c7',
  [ChainId.MUMBAI]: '0x0891b3728ba802e5240ae3552749eb23093ed2d5',
};

export const RESTRICTED_TOKENS: { [chainId in ChainId]?: string[] } = {
  [ChainId.MATIC]: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
  ],
};
