import { Currency } from '@uniswap/sdk-core';

export interface DualCurrencySelector {
  currencyA: Currency;
  currencyB: Currency | undefined;
}
