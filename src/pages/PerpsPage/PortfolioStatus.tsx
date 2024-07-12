import React from 'react';
import { usePositionStream } from '@orderly.network/hooks';
import { Box } from '@material-ui/core';
import { formatNumber } from 'utils';

export const PortfolioStatus: React.FC<{ token?: string }> = ({ token }) => {
  const [data] = usePositionStream(token);

  return (
    <Box className='portfolio_status' gridGap={16}>
      <Box>
        <p className='span text-secondary'>Unreal. PnL</p>
        <p className='small'>
          {formatNumber(data?.aggregated?.unrealPnL)} (
          {formatNumber(Number(data?.aggregated?.unrealPnlROI ?? 0) * 100)}%)
        </p>
      </Box>
      <Box>
        <p className='span text-secondary'>Notional</p>
        <p className='small'>{formatNumber(data?.aggregated?.notional)}</p>
      </Box>
    </Box>
  );
};
