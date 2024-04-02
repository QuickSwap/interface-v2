import React from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { Button } from '@material-ui/core';
import { API, OrderSide, OrderType } from '@orderly.network/types';

export const ClosePositionButton: React.FC<{
  position: API.PositionExt;
  quantity: number;
  price?: number;
}> = ({ position, quantity, price }) => {
  const { onSubmit } = useOrderEntry(
    {
      order_quantity: quantity,
      order_type: price ? OrderType.LIMIT : OrderType.MARKET,
      reduce_only: true,
      side: position.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
      symbol: position.symbol,
      order_price: price,
    },
    { watchOrderbook: true },
  );

  return (
    <Button
      className='orderTableActionButton'
      onClick={() => {
        onSubmit({
          order_quantity: quantity,
          order_type: price ? OrderType.LIMIT : OrderType.MARKET,
          reduce_only: true,
          side: position.position_qty < 0 ? OrderSide.BUY : OrderSide.SELL,
          symbol: position.symbol,
          order_price: price,
        });
      }}
    >
      Close
    </Button>
  );
};
