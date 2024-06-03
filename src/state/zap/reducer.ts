import { Token } from '@uniswap/sdk-core';
import { ZapType } from 'constants/index';
import { createReducer } from '@reduxjs/toolkit';
import {
  Field,
  replaceZapState,
  selectInputCurrency,
  selectOutputCurrency,
  setInputList,
  setRecipient,
  setZapNewOutputList,
  setZapType,
  typeInput,
  setOutputValue,
} from './actions';
import { V3TradeState } from 'hooks/v3/useBestV3Trade';

export interface ZapState {
  readonly independentField: Field;
  readonly typedValue: string;
  readonly outputValue: string;
  readonly zapRouteState: V3TradeState;
  readonly zapType: ZapType;
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined;
  };
  readonly [Field.OUTPUT]: {
    readonly currency1: string | undefined;
    readonly currency2: string | undefined;
  };
  readonly recipient: string | null;
  // TODO: this type is incorrect since it needs to handle chainId as well.
  readonly zapInputList: { [symbol: string]: Token } | undefined;
  readonly zapNewOutputList: { currencyIdA: string; currencyIdB: string }[];
}

const initialState: ZapState = {
  independentField: Field.INPUT,
  zapRouteState: V3TradeState.INVALID,
  zapType: ZapType.ZAP,
  typedValue: '',
  outputValue: '',
  [Field.INPUT]: {
    currencyId: 'ETH',
  },
  [Field.OUTPUT]: {
    currency1: '',
    currency2: '',
  },
  recipient: null,
  zapInputList: undefined,
  zapNewOutputList: [],
};

export default createReducer<ZapState>(initialState, (builder) =>
  builder
    .addCase(
      replaceZapState,
      (
        state,
        {
          payload: {
            typedValue,
            recipient,
            inputCurrencyId,
            outputCurrencyId,
            zapType,
          },
        }: any,
      ) => {
        return {
          ...state,
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            ...state[Field.OUTPUT],
            currency1: outputCurrencyId.currency1,
            currency2: outputCurrencyId.currency2,
          },
          independentField: Field.INPUT,
          zapType,
          typedValue,
          recipient,
        };
      },
    )
    .addCase(selectInputCurrency, (state, { payload: { currencyId } }) => {
      return {
        ...state,
        [Field.INPUT]: { currencyId },
      };
    })
    .addCase(
      selectOutputCurrency,
      (state, { payload: { currency1, currency2 } }) => {
        return {
          ...state,
          [Field.OUTPUT]: { currency1, currency2 },
        };
      },
    )
    .addCase(typeInput, (state, { payload: { typedValue } }) => {
      return {
        ...state,
        independentField: Field.INPUT,
        typedValue,
      };
    })
    .addCase(setOutputValue, (state, { payload: { outputValue } }) => {
      return {
        ...state,
        outputValue: outputValue ?? '',
      };
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient;
    })
    .addCase(setZapType, (state, { payload: { zapType } }) => {
      state.zapType = zapType;
    })
    .addCase(setInputList, (state, { payload: { zapInputList } }) => {
      return {
        ...state,
        zapInputList,
      };
    })
    .addCase(
      setZapNewOutputList,
      (state, { payload: { zapNewOutputList } }) => {
        return {
          ...state,
          zapNewOutputList,
        };
      },
    ),
);
