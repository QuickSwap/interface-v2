import React from 'react';
import { usePositionStream } from '@orderly.network/hooks';
import { Box } from '@material-ui/core';

export const PortfolioStatus: React.FC<{ token: string }> = ({ token }) => {
  const [data] = usePositionStream(token);

  return (
    <Box className='portfolio_status' gridGap={16}>
      <Box>
        <p className='span text-secondary'>Unreal. PnL</p>
        <p className='small'>{data.aggregated?.unrealPnL?.toFixed(2)}%</p>
      </Box>
      <Box>
        <p className='span text-secondary'>Notional</p>
        <p className='small'>{data.aggregated?.notional?.toFixed(2)}%</p>
      </Box>
      <Box>
        <p className='span text-secondary'>Unsettled PnL</p>
        <p className='small'>{data.aggregated?.unsettledPnL?.toFixed(2)}%</p>
      </Box>
    </Box>
  );
};
