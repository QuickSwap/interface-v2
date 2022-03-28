import React from 'react';
import { TradingViewChart } from 'components';

const SwapProChart: React.FC<{
  pairName: string;
  pairAddress: string;
  pairTokenReversed: boolean;
}> = ({ pairAddress, pairName, pairTokenReversed }) => {
  return (
    <TradingViewChart
      height='100%'
      pairAddress={pairAddress}
      pairName={pairName}
      pairTokenReversed={pairTokenReversed}
    />
  );
};

export default React.memo(SwapProChart);
