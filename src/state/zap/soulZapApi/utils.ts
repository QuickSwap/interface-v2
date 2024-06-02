import { ChainId } from '@uniswap/sdk';
import { NetworkNames } from '@soulsolidity/soul-zap-trpc-client';

export const getChainParam = (chain?: ChainId): NetworkNames | null => {
  return chain === ChainId.MATIC ? NetworkNames.POLYGON : null;
};
