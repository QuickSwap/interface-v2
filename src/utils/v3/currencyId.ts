import { Currency } from '@uniswap/sdk-core';
import { ChainId, ETHER } from '@uniswap/sdk';
import { CurrentPriceCard } from 'pages/PoolsPage/v3/CurrentPriceCard';

export function currencyId(currency: Currency, chainId: ChainId): string {
  if (currency.isToken) {
    return currency.address;
  }
  return ETHER[chainId].symbol ?? 'MATIC';
}
