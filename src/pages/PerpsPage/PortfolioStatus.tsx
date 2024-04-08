import React, { useMemo } from 'react';
import { useCollateral, usePositionStream } from '@orderly.network/hooks';
import { Box } from '@material-ui/core';
import { formatNumber } from 'utils';

export const PortfolioStatus: React.FC<{ token?: string }> = ({ token }) => {
  const [data] = usePositionStream(token);
  const { totalValue } = useCollateral();

  const unsettledPnLPercent = useMemo(() => {
    if (totalValue !== 0 || Number(data?.aggregated?.unsettledPnL ?? 0) !== 0) {
      const unsettledPnL = Number(data?.aggregated?.unsettledPnL ?? 0);
      return totalValue - unsettledPnL > 0
        ? (unsettledPnL / (totalValue - unsettledPnL)) * 100
        : 0;
    }
    return 0;
  }, [data?.aggregated?.unsettledPnL, totalValue]);

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
      <Box>
        <p className='span text-secondary'>Unsettled PnL</p>
        <p className='small'>
          {formatNumber(data?.aggregated?.unsettledPnL)} (
          {formatNumber(unsettledPnLPercent)}%)
        </p>
      </Box>
    </Box>
  );
};
