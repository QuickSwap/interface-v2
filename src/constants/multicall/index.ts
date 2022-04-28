import { ChainId } from '@uniswap/sdk';
import MULTICALL_ABI from './abi.json';

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MUMBAI]: '0xc7efb32470dee601959b15f1f923e017c6a918ca', //TODO: CHANGE THIS
  [ChainId.MATIC]: '0x02817C1e3543c2d908a590F5dB6bc97f933dB4BD',
};

export { MULTICALL_ABI, MULTICALL_NETWORKS };
