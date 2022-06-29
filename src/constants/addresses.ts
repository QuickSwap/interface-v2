import { ChainId } from '@uniswap/sdk';

type AddressMap = { [chainId: number]: string };

//TODO: Update these addresses to be quickswaps
export const POOL_DEPLOYER_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0x390e1f04bf44c33f491231e7865ff05e583813c5',
};

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0xe8bbDE0e17301EF1B9b1992CBfB1c9B2C2deDc97',
};

export const FINITE_FARMING: AddressMap = {
  [ChainId.MATIC]: '0xc247f1082c1487FF35E9b36634bBF3967a85E408',
};

export const INFINITE_FARMING_ADDRESS: AddressMap = {
  [ChainId.MATIC]: '0xb894E1c0d61FbF7eaf4056dFadcDe720D46B71e2',
};

export const FARMING_CENTER: AddressMap = {
  [ChainId.MATIC]: '0x258EE55b7E5B8890117cBf444b9cF4ed53688651',
};

export const SWAP_ROUTER_ADDRESSES: AddressMap = {
  [ChainId.MATIC]: '0x1a5bC2d507465c3e343Ca4e8B5C37Dd6B580f2C2',
};
