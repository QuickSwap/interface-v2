import React from 'react';
import { useOrderEntry } from '@orderly.network/hooks';
import { API, OrderSide, OrderType } from '@orderly.network/types';
import { Button, Table } from '@radix-ui/themes';
import { FC } from 'react';

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
    <Table.Row style={{ verticalAlign: 'middle' }}>
      <Table.Cell>{new Date(timestamp).toLocaleString()}</Table.Cell>
      <Table.Cell>{formatter.format(average_open_price)}</Table.Cell>
      <Table.Cell>{formatter.format(position_qty)}</Table.Cell>
      <Table.Cell>{formatter.format(notional)}</Table.Cell>
      <Table.Cell>{formatter.format(unrealized_pnl)}</Table.Cell>
      <Table.Cell>
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
      </Table.Cell>
    </Table.Row>
  );
};
