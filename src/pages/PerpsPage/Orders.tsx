import React from 'react';
import { useOrderStream } from '@orderly.network/hooks';
import { OrderSide, OrderStatus, OrderType } from '@orderly.network/types';
import { Button, Flex, Heading, Table } from '@radix-ui/themes';
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
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Orders</Heading>

      <Table.Root>
        <Table.Header>
          <Table.Row style={{ color: 'white' }}>
            <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Price (USDC)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Quantity (ETH)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Side</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body style={{ color: 'white' }}>
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
                <Table.Row
                  key={order_id}
                  style={{ verticalAlign: 'middle', color: 'white' }}
                >
                  <Table.Cell>
                    {new Date(created_time).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>{price}</Table.Cell>
                  <Table.Cell>{quantity}</Table.Cell>
                  <Table.Cell>{type}</Table.Cell>
                  <Table.Cell>{side}</Table.Cell>
                  <Table.Cell>{status}</Table.Cell>
                  <Table.Cell>
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
                  </Table.Cell>
                </Table.Row>
              ),
            )}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};
