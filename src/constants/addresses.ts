import { ChainId } from '@uniswap/sdk';

type AddressMap = { [chainId: number]: string };

//TODO: Update these addresses to be quickswaps
export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x218a510d4d6aEA897961ab6Deb74443521A88839',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x21F5F8b46621cFa77D4f296A901cDB7AfDBB6A18',
};

export const FINITE_FARMING: AddressMap = {
  [ChainId.MATIC]: '0x88721ec14bb41078c65df5c85b85e50f77c04d79',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x9e448afe97fc6bed274110e0e3a034cec55fbcb5',
};

export const FARMING_CENTER: AddressMap = {
  [ChainId.MATIC]: '0x7060ef7374a081f9a09dbcd3f5c38b2985299044',
};
