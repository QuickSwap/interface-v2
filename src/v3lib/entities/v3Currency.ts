import invariant from 'tiny-invariant';
import { Currency, NativeCurrency, Token } from '@uniswap/sdk-core';
import { WMATIC_EXTENDED } from 'constants/v3/addresses';

/**
 * Ether is the main usage of a 'native' currency, i.e. for Ethereum mainnet and all testnets
 */
export class V3Currency extends NativeCurrency {
  public constructor(
    chainId: number,
    decimals: number,
    symbol?: string,
    name?: string,
  ) {
    super(chainId, decimals, symbol, name);
  }

  public get wrapped(): Token {
    const weth9 = WMATIC_EXTENDED[this.chainId];
    invariant(!!weth9, 'WRAPPED');
    return weth9;
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }
}
