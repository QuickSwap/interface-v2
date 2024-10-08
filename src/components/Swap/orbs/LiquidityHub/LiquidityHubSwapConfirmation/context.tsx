import React from 'react';
import { createContext, useCallback } from 'react';
import { CurrencyAmount, Currency } from '@uniswap/sdk-core';
import {
  LiquidityHubConfirmationProps,
  LiquidityHubConfirmationState,
} from '../../types';
import { fromRawAmount } from '../../utils';
import { useConfirmationStore } from '../../hooks';

interface ContextValues extends LiquidityHubConfirmationProps {
  inAmount?: CurrencyAmount<Currency>;
  outAmount?: CurrencyAmount<Currency>;
  minAmountOut?: CurrencyAmount<Currency>;
  store: LiquidityHubConfirmationState;
  updateStore: (payload: Partial<LiquidityHubConfirmationState>) => void;
  resetStore: () => void;
}
const Context = createContext({} as ContextValues);

interface ContextProps extends LiquidityHubConfirmationProps {
  children: React.ReactNode;
}

export const ContextProvider = ({ children, ...props }: ContextProps) => {
  const { updateStore, store, resetStore } = useConfirmationStore<
    LiquidityHubConfirmationState
  >({} as LiquidityHubConfirmationState);
  const quote = store.acceptedQuote || props.quoteQuery.data;
  const onDismiss = useCallback(() => {
    setTimeout(() => {
      resetStore();
    }, 5_00);
    props.onDismiss();
  }, [props, resetStore]);

  return (
    <Context.Provider
      value={{
        ...props,
        inAmount: fromRawAmount(props.inCurrency, quote?.inAmount),
        outAmount: fromRawAmount(props.outCurrency, quote?.outAmount),
        minAmountOut: fromRawAmount(props.outCurrency, quote?.minAmountOut),
        store,
        onDismiss,
        updateStore,
        resetStore,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useLiquidityHubConfirmationContext = () => {
  return React.useContext(Context);
};
