import { Token } from '@uniswap/sdk-core';

/**
 * Known WETH9 implementation addresses, used in our implementation of Ether#wrapped
 */
export const WMATIC: { [chainId: number]: Token } = {
  [137]: new Token(
    137,
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    18,
    'WMATIC',
    'Wrapped Matic',
  ),
};
