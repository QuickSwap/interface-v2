import polygon from './polygon.json';
import dogechain from './dogechain.json';
import { ChainId } from '@uniswap/sdk';
const configs: any = {
  [ChainId.MATIC]: polygon,
  [ChainId.DOGECHAIN]: dogechain,
};

export const getConfig = (network: ChainId | undefined) => {
  if (network === undefined) {
    return configs[ChainId.MATIC];
  }
  return configs[network];
};
