import { Currency } from '@uniswap/sdk-core';

export interface DualCurrencySelector {
  currencyA: Currency | null | undefined;
  currencyB: Currency | null | undefined;
}
