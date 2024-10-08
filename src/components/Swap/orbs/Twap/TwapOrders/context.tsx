import { Order } from '@orbs-network/twap-sdk';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useTwapOrdersQuery } from '../hooks';


interface ContextValues {
  selectedOrderId: number | undefined;
  setSelectedOrderId: (payload?: number) => void;
  selectedOrder?: Order;
  onOpen: () => void;
  onDismiss: () => void;
  isOpen: boolean;
}

const Context = createContext({} as ContextValues);

interface Props {
  children: React.ReactNode;
}

export const TwapOrdersProvider = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(
    undefined,
  );
  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onDismiss = useCallback(() => {
    setIsOpen(false);
  }, []);

  const { data } = useTwapOrdersQuery();
  const selectedOrder = useMemo(
    () => data?.find((order) => order.id === selectedOrderId),
    [data, selectedOrderId],
  );
  return (
    <Context.Provider
      value={{
        selectedOrderId,
        setSelectedOrderId,
        selectedOrder,
        onOpen,
        onDismiss,
        isOpen,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useTwapOrdersContext = () => {
  return React.useContext(Context);
};
