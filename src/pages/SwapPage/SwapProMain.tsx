import { Box, Grid, styled } from '@material-ui/core';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { getSwapTransactions, getSwapTransactionsV3 } from 'utils';
import { SwapBuySellMiniWidget } from './BuySellWidget';
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
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;
  const { isV2 } = useIsV2();
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

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
        let txns: any[] = [];
        if (pairId.v2) {
          const v2Txns = await getSwapTransactions(
            chainIdToUse,
            pairId.v2.toLowerCase(),
            Number(transactions[0].transaction.timestamp),
          );
          txns = txns.concat(v2Txns ?? []);
        }
        if (pairId.v3) {
          const v3Txns = await getSwapTransactionsV3(
            chainIdToUse,
            pairId.v3.toLowerCase(),
            Number(transactions[0].transaction.timestamp),
          );
          txns = txns.concat(v3Txns ?? []);
        }
        const filteredTxns = txns.filter(
          (txn) =>
            !transactions.find(
              (tx) => tx.transaction.id === txn.transaction.id,
            ),
        );
        setTransactions([...filteredTxns, ...transactions]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, chainIdToUse]);

  useEffect(() => {
    async function getTradesData(pairId: any) {
      setTransactions(undefined);
      let transactions: any[] = [];

      if (pairId.v2) {
        const v2Transactions = await getSwapTransactions(
          chainIdToUse,
          pairId.v2.toLowerCase(),
        );
        transactions = transactions.concat(v2Transactions ?? []);
      }

      if (pairId.v3) {
        const v3Transactions = await getSwapTransactionsV3(
          chainIdToUse,
          pairId.v3.toLowerCase(),
        );
        transactions = transactions.concat(v3Transactions ?? []);
      }

      setTransactions(transactions);
    }
    if (pairId) {
      getTradesData(pairId);
    }
  }, [pairId, chainIdToUse]);

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
                showChart={true}
                showTrades={false}
                token1={token1}
                token2={token2}
                pairAddress={isV2 ? pairId?.v2 : pairId?.v3}
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
