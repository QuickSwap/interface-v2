import React from 'react';
import { usePositionStream } from '@orderly.network/hooks';
import { Flex, Heading, Table } from '@radix-ui/themes';
import { FC } from 'react';

import { PositionExt, PositionExtFixed } from './PositionExt';

export const Positions: FC = () => {
  const [positions, _, { refresh }] = usePositionStream('PERP_ETH_USDC');

  return (
    <Flex
      style={{ margin: '1.5rem' }}
      gap='3'
      align='center'
      justify='center'
      direction='column'
    >
      <Heading>Positions</Heading>

      <Table.Root>
        <Table.Header>
          <Table.Row style={{ color: 'white' }}>
            <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Avg. Price (USDC)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Quantity (ETH)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Notional (USDC)</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Unrealized PnL</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body style={{ color: 'white' }}>
          {positions.rows &&
            positions.rows.map((position) => (
              <PositionExt
                position={position as PositionExtFixed}
                refresh={refresh}
                key={position.symbol}
              />
            ))}
        </Table.Body>
      </Table.Root>
    </Flex>
  );
};
