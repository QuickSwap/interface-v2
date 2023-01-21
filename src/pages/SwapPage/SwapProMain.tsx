import { Box, Grid, styled, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { SwapBuySellMiniWidget } from './BuySellWidget';
// import { SwapBuySellWidget } from './BuySellWidget';
import SwapMain from './SwapMain';
import SwapProAssets from './SwapProAssets';
import SwapProChartTrade from './SwapProChartTrade';
import SwapProInfo from './SwapProInfo';
import SwapProTransactions from './SwapProTransactions';
import TickerWidget from './TickerWidget';

const Item = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export interface SwapProMainProps {
  token1: any;
  token2: any;
  transactions: any;
  pairId: any;
  pairTokenReversed: any;
}

const SwapProMain: React.FC<SwapProMainProps> = ({
  token1,
  token2,
  transactions,
  pairId,
  pairTokenReversed,
}) => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const [showChart, setShowChart] = useState(true);
  const [showTrades, setShowTrades] = useState(true);

  return (
    <Box>
      <Box>
        <TickerWidget />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Item className='bg-palette'>
              <SwapProAssets />
            </Item>
            <Item className='bg-palette mt-1'>
              {/* <SwapBuySellWidget /> */}
              <SwapBuySellMiniWidget />
            </Item>
          </Grid>
          <Grid item xs={12} md={6}>
            <Item
              className='bg-palette  swapProWrapper'
              style={{ maxHeight: '100vh', minHeight: '500px', padding: '0' }}
            >
              <SwapProChartTrade
                showChart={showChart}
                showTrades={false}
                token1={token1}
                token2={token2}
                pairAddress={pairId}
                pairTokenReversed={pairTokenReversed}
                transactions={transactions}
              />
            </Item>
            <Item className='bg-palette  mt-1' style={{ padding: 0 }}>
              <SwapMain />
            </Item>
          </Grid>
          <Grid item xs={12} md={3}>
            <Item className='bg-palette'>
              <SwapProInfo
                token1={token1}
                token2={token2}
                transactions={transactions}
                showHeading={false}
              />
            </Item>
            <Item className='bg-palette  mt-1'>
              <SwapProTransactions data={transactions || []} />
            </Item>
          </Grid>
          <Grid item xs={12} md={3}></Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SwapProMain;
