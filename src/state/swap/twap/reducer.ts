import { createReducer } from '@reduxjs/toolkit';
import { TimeDuration } from '@orbs-network/twap-sdk';
import {
  Field,
  replaceSwapState,
  selectCurrency,
  SwapDelay,
  switchCurrencies,
  typeInput,
  setSwapDelay,
  setChunks,
  setFillDelay,
  setDuration,
  invertTradePrice,
  setUpdatingOrders,
  setIsMarketOrder,
  setTradePrice,
  resetTradePrice,
} from './actions';

export interface TwapSwapState {
  readonly typedValue: string;
  readonly chunks?: number;
  readonly fillDelay?: TimeDuration;
  readonly duration?: TimeDuration;
  readonly tradePrice?: string;
  readonly isMarketOrder?: boolean;
  readonly isTradePriceInverted?: boolean;
  readonly updatingOrders?: boolean;

  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly swapDelay: SwapDelay;
}

const initialState: TwapSwapState = {
  typedValue: '',
  isMarketOrder: false,
  [Field.INPUT]: {
    currencyId: '',
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  swapDelay: SwapDelay.INIT,
};

export default createReducer<TwapSwapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceSwapState,
      (
        state,
        {
          payload: { typedValue, inputCurrencyId, outputCurrencyId, swapDelay },
        },
      ) => {
        return {
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          typedValue: typedValue,
          swapDelay,
        };
      },
    )
    .addCase(selectCurrency, (state, { payload: { currencyId, field } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT;
      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        };
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId },
        };
      }
    })
    .addCase(switchCurrencies, (state) => {
      return {
        ...state,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      };
    })
    .addCase(typeInput, (state, { payload: { field, typedValue } }) => {
      return {
        ...state,
        independentField: field,
        typedValue,
      };
    })

    .addCase(setSwapDelay, (state, { payload: { swapDelay } }) => {
      state.swapDelay = swapDelay;
    })

    .addCase(setChunks, (state, { payload: { chunks } }) => {
      state.chunks = chunks;
    })
    .addCase(setFillDelay, (state, { payload: { fillDelay } }) => {
      state.fillDelay = fillDelay;
    })
    .addCase(setDuration, (state, { payload: { duration } }) => {
      state.duration = duration;
    })
    .addCase(setUpdatingOrders, (state, { payload: { updatingOrders } }) => {
      state.updatingOrders = updatingOrders;
    })
    .addCase(setIsMarketOrder, (state, { payload: { isMarketOrder } }) => {
      state.isMarketOrder = isMarketOrder;
    })
    .addCase(setTradePrice, (state, { payload: { tradePrice } }) => {
      state.tradePrice = tradePrice;
    })
    .addCase(resetTradePrice, (state, { payload }) => {
      state.tradePrice = undefined;
      state.isTradePriceInverted = false;
    })

    .addCase(
      invertTradePrice,
      (state, { payload: { isTradePriceInverted } }) => {
        state.isTradePriceInverted = isTradePriceInverted;
        state.tradePrice = undefined;
      },
    ),
);
