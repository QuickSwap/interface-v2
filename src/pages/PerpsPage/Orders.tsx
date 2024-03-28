import React from 'react';
import { useOrderStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { FC } from 'react';

type Order = {
  price: number;
  quantity: number;
  created_time: number;
  order_id: number;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  executed: number;
};

export const Orders: FC = () => {
  const [o, { cancelOrder }] = useOrderStream({ symbol: 'PERP_ETH_USDC' });
  const orders = o as Order[] | null;

  return (
    <Box style={{ margin: '1.5rem' }}>
      <h2>Orders</h2>

      <Table>
        <TableHead>
          <TableRow style={{ color: 'white' }}>
            <TableCell>Created</TableCell>
            <TableCell>Price (USDC)</TableCell>
            <TableCell>Quantity (ETH)</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Side</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody style={{ color: 'white' }}>
          {orders &&
            orders.map(
              ({
                created_time,
                price,
                quantity,
                type,
                side,
                status,
                order_id,
              }) => (
                <TableRow
                  key={order_id}
                  style={{ verticalAlign: 'middle', color: 'white' }}
                >
                  <TableCell>
                    {new Date(created_time).toLocaleString()}
                  </TableCell>
                  <TableCell>{price}</TableCell>
                  <TableCell>{quantity}</TableCell>
                  <TableCell>{type}</TableCell>
                  <TableCell>{side}</TableCell>
                  <TableCell>{status}</TableCell>
                  <TableCell>
                    {[
                      OrderStatus.OPEN,
                      OrderStatus.NEW,
                      OrderStatus.PARTIAL_FILLED,
                    ].includes(status) && (
                      <Button
                        onClick={async () => {
                          await cancelOrder(order_id, 'PERP_ETH_USDC');
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ),
            )}
        </TableBody>
      </Table>
    </Box>
  );
};
