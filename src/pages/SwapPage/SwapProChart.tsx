import React from 'react';
import { AdvancedChart } from 'react-tradingview-embed';

const SwapProChart: React.FC = () => {
  return (
    <AdvancedChart
      widgetProps={{ theme: 'dark', symbol: 'QUICKSWAP:QUICKOM' }}
    />
  );
};

export default React.memo(SwapProChart);
