import { createAction } from '@reduxjs/toolkit';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCurrency = createAction<{
  field: Field;
  currencyId: string;
}>('swap/selectCurrency');
export const switchCurrencies = createAction<void>('swap/switchCurrencies');
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  'swap/typeInput',
);
export const replaceSwapState = createAction<{
  field: Field;
  typedValue: string;
  inputCurrencyId?: string;
  outputCurrencyId?: string;
  recipient: string | null;
}>('swap/replaceSwapState');
export const setRecipient = createAction<{ recipient: string | null }>(
  'swap/setRecipient',
);

type SearchSummary = {
  expectedProfit?: number;
  expectedUsdProfit?: number;
  firstTokenAddress?: string;
  firstTokenAmount?: number;
  expectedKickbackProfit?: number;
};

type TransactionArgs = {
  data: string;
  destination: string;
  sender: string;
  value: string;
  masterInput: string;
};

export type DataResponse = {
  pathFound: boolean;
  summary?: { searchSummary?: SearchSummary };
  transactionArgs: TransactionArgs;
};
