import { Token } from '@uniswap/sdk-core';

export const toToken = (t: {
  chainId: number;
  address: string;
  decimals: number;
  symbol?: string;
  name?: string;
}): Token => {
  return new Token(t.chainId, t.address, t.decimals, t.symbol, t.name);
};

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] };
} = {};
