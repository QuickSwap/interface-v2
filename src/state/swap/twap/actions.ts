import { createAction } from '@reduxjs/toolkit';
import { SmartRouter, RouterTypes } from 'constants/index';
import { TimeDuration } from '@orbs-network/twap-sdk';

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export enum SwapDelay {
  INIT = 'INIT', // The initial state of the swap cycle before a user interaction
  USER_INPUT = 'USER_INPUT', // Swap state when a user is inputing a trade
  USER_INPUT_COMPLETE = 'USER_INPUT_COMPLETE', // To let the app know when to start calculating swaps
  FETCHING_SWAP = 'FETCHING_SWAP', // To not calculate swaps on every keystroke
  SWAP_COMPLETE = 'SWAP_COMPLETE', // When the swap is ready to be displayed and fetch a bonus
  FETCHING_BONUS = 'FETCHING_BONUS', // Checks if the swap has a valid bous route
  SWAP_REFRESH = 'SWAP_REFRESH', // The last state that lets the app know to refresh routes to check for changes
}

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

export interface RouterTypeParams {
  routerType: RouterTypes;
  smartRouter: SmartRouter;
  bonusRouter?: DataResponse;
}

export const selectCurrency = createAction<{
  field: Field;
  currencyId: string;
}>('twap/selectCurrency');
export const switchCurrencies = createAction<void>('twap/switchCurrencies');
export const typeInput = createAction<{ field: Field; typedValue: string }>(
  'twap/typeInput',
);
export const setSwapDelay = createAction<{ swapDelay: SwapDelay }>(
  'twap/swapDelay',
);

export const setChunks = createAction<{ chunks: number }>('twap/setChunks');

export const setTradePrice = createAction<{
  tradePrice?: string;
}>('twap/setTradePrice');

export const setIsMarketOrder = createAction<{ isMarketOrder: boolean }>(
  'twap/setIsMarketOrder',
);

export const toggleMarketOrder = createAction('twap/toggleMarketOrder');

export const setUpdatingOrders = createAction<{ updatingOrders: boolean }>(
  'twap/setUpdatingOrders',
);

export const setFillDelay = createAction<{ fillDelay: TimeDuration }>(
  'twap/setFillDelay',
);

export const resetTradePrice = createAction('twap/resetTradePrice');

export const setDuration = createAction<{ duration?: TimeDuration }>(
  'twap/setDuration',
);

export const invertTradePrice = createAction<{ isTradePriceInverted: boolean }>(
  'twap/invertTradePrice',
);

export const replaceSwapState = createAction<{
  typedValue: string;
  inputCurrencyId?: string;
  outputCurrencyId?: string;
  swapDelay: SwapDelay;
}>('twap/replaceSwapState');
export const setRecipient = createAction<{ recipient: string | null }>(
  'twap/setRecipient',
);
