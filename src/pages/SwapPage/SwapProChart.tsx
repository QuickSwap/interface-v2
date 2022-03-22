import React from 'react';
import { AdvancedChart } from 'react-tradingview-embed';

const SwapProChart: React.FC = () => {
  return (
    <AdvancedChart
      widgetProps={{
        theme: 'dark',
        height: '100%',
        symbol: 'BINANCE:QUICKUSDT',
        range: '1D',
        style: '1',
      }}
    />
  );
};

export default React.memo(SwapProChart);
