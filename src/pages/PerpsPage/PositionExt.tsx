import React from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { API, OrderSide, OrderType } from '@orderly.network/types';
import { FC } from 'react';
import { Button, TableCell, TableRow } from '@material-ui/core';

export type PositionExtFixed = API.PositionExt & { unrealized_pnl: number };

export const PositionExt: FC<{
  position: PositionExtFixed;
  refresh: () => void;
}> = ({ position, refresh }) => {
  const {
    timestamp,
    average_open_price,
    notional,
    position_qty,
    unrealized_pnl,
  } = position;
  const side = position_qty < 0 ? OrderSide.BUY : OrderSide.SELL;
  const { onSubmit, maxQty } = useOrderEntry('PERP_ETH_USDC', side, true);

  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 3,
  });

  return (
    <TableRow style={{ verticalAlign: 'middle' }}>
      <TableCell>{new Date(timestamp).toLocaleString()}</TableCell>
      <TableCell>{formatter.format(average_open_price)}</TableCell>
      <TableCell>{formatter.format(position_qty)}</TableCell>
      <TableCell>{formatter.format(notional)}</TableCell>
      <TableCell>{formatter.format(unrealized_pnl)}</TableCell>
      <TableCell>
        <Button
          onClick={async () => {
            await onSubmit({
              order_type: OrderType.MARKET,
              symbol: 'PERP_ETH_USDC',
              reduce_only: true,
              side,
              order_quantity: maxQty,
            });
            refresh();
          }}
        >
          Cancel
        </Button>
      </TableCell>
    </TableRow>
  );
};
