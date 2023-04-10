import polygon from './polygon.json';
import dogechain from './dogechain.json';
import zktestnet from './zktestnet.json';
import zkmainnet from './zkmainnet.json';
import { ChainId } from '@uniswap/sdk';
const configs: any = {
  [ChainId.MATIC]: polygon,
  [ChainId.MUMBAI]: polygon,
  [ChainId.DOGECHAIN]: dogechain,
  [ChainId.DOEGCHAIN_TESTNET]: dogechain,
  [ChainId.ZKTESTNET]: zktestnet,
  [ChainId.ZKEVM]: zkmainnet,
};

export const getConfig = (network: ChainId | undefined) => {
  if (network === undefined) {
    return configs[ChainId.MATIC];
  }
  const config = configs[network];
  return config;
};
