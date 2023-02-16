import { Box, Grid, styled, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { getSwapTransactions } from 'utils';
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
  pairId: any;
  pairTokenReversed: any;
}

const SwapProMain: React.FC<SwapProMainProps> = ({
  token1,
  token2,
  pairId,
  pairTokenReversed,
}) => {
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [showChart, setShowChart] = useState(true);
  const [showTrades, setShowTrades] = useState(true);

  // this is for refreshing data of trades table every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      if (pairId && transactions && transactions.length > 0) {
        const txns = await getSwapTransactions(
          pairId,
          Number(transactions[0].transaction.timestamp),
        );
        if (txns) {
          const filteredTxns = txns.filter(
            (txn) =>
              !transactions.find(
                (tx) => tx.transaction.id === txn.transaction.id,
              ),
          );
          setTransactions([...filteredTxns, ...transactions]);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  useEffect(() => {
    async function getTradesData(pairId: string) {
      setTransactions(undefined);
      const transactions = await getSwapTransactions(pairId);
      setTransactions(transactions);
    }
    if (pairId) {
      getTradesData(pairId);
    }
  }, [pairId]);

  return (
    <Box>
      <Box>
        <TickerWidget />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={3}>
            <Item className='bg-palette'>
              <SwapProAssets />
            </Item>
            <Item className='bg-palette mt-1'>
              {/* <SwapBuySellWidget /> */}
              <SwapBuySellMiniWidget />
            </Item>
          </Grid>
          <Grid item xs={12} lg={6}>
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
          <Grid item xs={12} lg={3}>
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
          <Grid item xs={12} lg={3}></Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SwapProMain;
