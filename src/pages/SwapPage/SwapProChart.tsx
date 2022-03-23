import React from 'react';
import { AdvancedChart } from 'react-tradingview-embed';

const SwapProChart: React.FC<{ symbol1?: string; symbol2?: string }> = ({
  symbol1,
  symbol2,
}) => {
  return (
    <AdvancedChart
      widgetProps={{
        theme: 'dark',
        height: '100%',
        symbol: `QUICKSWAP:${symbol1}${symbol2}`,
        range: '1D',
        style: '1',
      }}
    />
  );
};

export default React.memo(SwapProChart);
