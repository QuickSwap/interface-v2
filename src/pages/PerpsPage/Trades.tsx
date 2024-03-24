import React from 'react';
import { useMarketTradeStream } from '@orderly.network/hooks';
import { FC } from 'react';
import { Box } from '@material-ui/core';

export const Trades: FC = () => {
  const trades = useMarketTradeStream('PERP_ETH_USDC');
  console.log('trades', trades);

  return (
    <Box style={{ margin: '1.5rem' }}>
      <h2>Trades</h2>
    </Box>
  );
};
