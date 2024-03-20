import React from 'react';
import { usePositionStream } from '@orderly.network/hooks';
import { FC } from 'react';

import { PositionExt, PositionExtFixed } from './PositionExt';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';

export const Positions: FC = () => {
  const [positions, _, { refresh }] = usePositionStream('PERP_ETH_USDC');

  return (
    <Box style={{ margin: '1.5rem' }}>
      <h2>Positions</h2>

      <Table>
        <TableHead>
          <TableRow style={{ color: 'white' }}>
            <TableCell>Created</TableCell>
            <TableCell>Avg. Price (USDC)</TableCell>
            <TableCell>Quantity (ETH)</TableCell>
            <TableCell>Notional (USDC)</TableCell>
            <TableCell>Unrealized PnL</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody style={{ color: 'white' }}>
          {positions.rows &&
            positions.rows.map((position) => (
              <PositionExt
                position={position as PositionExtFixed}
                refresh={refresh}
                key={position.symbol}
              />
            ))}
        </TableBody>
      </Table>
    </Box>
  );
};
