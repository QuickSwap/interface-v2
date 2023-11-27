import { createAction } from '@reduxjs/toolkit';
import { Currency } from '@uniswap/sdk-core';

export const typeInput = createAction<{
  typedValue: string;
}>('singleToken/typeInput');
export const selectCurrency = createAction<{
  currency: Currency;
}>('singleToken/selectCurrency');
export const selectVault = createAction<{
  vault: string;
}>('singleToken/selectVault');
