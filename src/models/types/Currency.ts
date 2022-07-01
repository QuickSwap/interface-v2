import { Currency } from '@uniswap/sdk-core';

export type WrappedCurrency = Currency & { address: string; symbol: string };
