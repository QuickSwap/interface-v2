import { ConfirmationState } from 'components/Swap/orbs/types';
import React from 'react';
import { createContext, useCallback } from 'react';
import { Field } from 'state/swap/twap/actions';
import { useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { useConfirmationStore } from '../../hooks';

const DISMISS_TIMEOUT = 500;

interface ContextValues {
  state: ConfirmationState;
  updateStore: (payload: Partial<ConfirmationState>) => void;
  resetStore: () => void;
  isOpen: boolean;
  onDismiss: () => void;
}
const Context = createContext({} as ContextValues);

interface ContextProps {
  children: React.ReactNode;
  isOpen: boolean;
  onDismiss: () => void;
}

export const ContextProvider = ({ children, ...props }: ContextProps) => {
  const { updateStore, store, resetStore } = useConfirmationStore<
    ConfirmationState
  >({} as ConfirmationState);

  const { onUserInput } = useTwapSwapActionHandlers();

  const onDismiss = useCallback(() => {
    setTimeout(() => {
      resetStore();
      onUserInput(Field.INPUT, '');
    }, DISMISS_TIMEOUT);
    props.onDismiss();
  }, [props.onDismiss, resetStore, onUserInput]);

  return (
    <Context.Provider
      value={{
        ...props,
        state: store,
        onDismiss,
        updateStore,
        resetStore,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTwapConfirmationContext = () => {
  return React.useContext(Context);
};
