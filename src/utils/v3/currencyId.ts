import { Currency } from '@uniswap/sdk-core';

export function currencyId(currency: Currency, chainId: number): string {
  let chainSymbol = 'MATIC';

  if (chainId === 137) {
    chainSymbol = 'MATIC';
  }
  if (chainId === 2000) {
    chainSymbol = 'WDOGE';
  }
  if (chainId === 1402) {
    chainSymbol = 'ETH';
  }

  if (currency.isNative) return chainSymbol;
  if (currency.isToken) return currency.address;
  throw new Error('invalid currency');
}
