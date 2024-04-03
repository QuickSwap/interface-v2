import { Box } from '@material-ui/core';
import React from 'react';
import { AdvancedChart } from 'react-tradingview-embed';

interface AdvancedChartWrapperProps {
  token: string;
}

const AdvancedChartWrapper: React.FC<AdvancedChartWrapperProps> = ({
  token,
}) => {
  function trimPairName(pairName: string): string {
    const parts = pairName.split('_');
    if (parts.length !== 3) {
      throw new Error('The pair name does not match the expected format.');
    }
    return parts[1] + parts[2];
  }

  const widgetProps = {
    symbol: trimPairName(token),
    timezone: 'Etc/UTC',
    theme: 'dark',
    hide_side_toolbar: true,
    hide_top_toolbar: true,
    withdateranges: true,
    save_image: false,
    allow_symbol_change: false,
    height: 444,
  };

  return (
    <Box flex={1}>
      <AdvancedChart widgetProps={widgetProps} />
    </Box>
  );
};

export default React.memo(AdvancedChartWrapper);
