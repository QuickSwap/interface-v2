import { createAction } from '@reduxjs/toolkit';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export const selectCurrency = createAction<{
  field: Field;
  currencyId: string;
}>('swapV3/selectCurrency');
export const switchCurrencies = createAction<void>('swapV3/switchCurrencies');
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  'swapV3/typeInput',
);
export const replaceSwapState = createAction<{
  field: Field;
  typedValue: string;
  inputCurrencyId?: string;
  outputCurrencyId?: string;
  recipient: string | null;
}>('swapV3/replaceSwapState');
export const setRecipient = createAction<{ recipient: string | null }>(
  'swapV3/setRecipient',
);
