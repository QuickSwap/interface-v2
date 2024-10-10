import React from 'react';
import { TwapOrdersList } from './TwapOrdersList';
import { ShowOrdersButton } from './ShowOrdersButton';
import { TwapOrdersModal } from './TwapOrdersModal';
import { TwapSelectedOrder } from './TwapSelectedOrder';
import { TwapOrdersProvider } from './context';

export function TwapOrders() {
  return (
    <TwapOrdersProvider>
      <TwapOrdersModal>
        <TwapSelectedOrder />
        <TwapOrdersList />
      </TwapOrdersModal>
      <ShowOrdersButton />
    </TwapOrdersProvider>
  );
}
