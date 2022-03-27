import React from 'react';
import { TradingViewChart } from 'components';
// import { AdvancedChart } from 'react-tradingview-embed';

const SwapProChart: React.FC<{ pairName: string; pairAddress: string }> = ({
  pairAddress,
  pairName,
}) => {
  return (
    <TradingViewChart
      height='100%'
      pairAddress={pairAddress}
      pairName={pairName}
    />
  );
};

export default React.memo(SwapProChart);
