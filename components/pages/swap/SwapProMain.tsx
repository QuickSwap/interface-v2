import { Box, Grid, styled } from '@mui/material';
import { ChainId } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useIsV2 } from 'state/application/hooks';
import { SwapBuySellMiniWidget } from './BuySellWidget';
import SwapMain from './SwapMain';
import SwapProAssets from './SwapProAssets';
import SwapProChartTrade from './SwapProChartTrade';
import SwapProInfo from './SwapProInfo';
import SwapProTransactions from './SwapProTransactions';
import TickerWidget from './TickerWidget';
import styles from 'styles/pages/Swap.module.scss';

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
          const res = await fetch(
            `${
              process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL
            }/utils/swap-transactions/${
              pairId.v2
            }/v2?chainId=${chainIdToUse}&startTime=${Number(
              transactions[0].transaction.timestamp,
            )}`,
          );
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              errorText ||
                res.statusText ||
                `Failed to get v2 swap transactions`,
            );
          }
          const data = await res.json();
          const v2Txns =
            data && data.data && data.data.transactions
              ? data.data.transactions
              : [];
          txns = txns.concat(v2Txns ?? []);
        }
        if (pairId.v3) {
          const res = await fetch(
            `${
              process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL
            }/utils/swap-transactions/${
              pairId.v3
            }/v3?chainId=${chainIdToUse}&startTime=${Number(
              transactions[0].transaction.timestamp,
            )}`,
          );
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(
              errorText ||
                res.statusText ||
                `Failed to get v3 swap transactions`,
            );
          }
          const data = await res.json();
          const v3Txns =
            data && data.data && data.data.transactions
              ? data.data.transactions
              : [];
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/swap-transactions/${pairId.v2}/v2?chainId=${chainIdToUse}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get v2 swap transactions`,
          );
        }
        const data = await res.json();
        const v2Transactions =
          data && data.data && data.data.transactions
            ? data.data.transactions
            : [];
        transactions = transactions.concat(v2Transactions ?? []);
      }

      if (pairId.v3) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LEADERBOARD_APP_URL}/utils/swap-transactions/${pairId.v3}/v3?chainId=${chainIdToUse}`,
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            errorText || res.statusText || `Failed to get v3 swap transactions`,
          );
        }
        const data = await res.json();
        const v3Transactions =
          data && data.data && data.data.transactions
            ? data.data.transactions
            : [];
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
            <Item className='mt-1 bg-palette'>
              {/* <SwapBuySellWidget /> */}
              <SwapBuySellMiniWidget />
            </Item>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Item
              className={`bg-palette ${styles.swapProWrapper}`}
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
            <Item className='mt-1 bg-palette' style={{ padding: 0 }}>
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
            <Item className='mt-1 bg-palette'>
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
