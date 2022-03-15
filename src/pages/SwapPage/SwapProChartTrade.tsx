import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SwapProChart from './SwapProChart';
import { Token } from '@uniswap/sdk';
import { Box } from '@material-ui/core';
import { Height } from '@material-ui/icons';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import 'react-reflex/styles.css';
import {
  getSwapTransactions,
  formatNumber,
  shortenTx,
  getEtherscanLink,
} from 'utils';
import moment from 'moment';
import { useActiveWeb3React } from 'hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  splitPane: {
    '& [data-type=Resizer]': {
      margin: '8px 0 0',
    },
  },
  tradeTable: {
    width: '100%',
    '& thead tr th, & tbody tr td': {
      borderRight: `1px solid ${palette.divider}`,
      '&:last-child': {
        borderRight: 'none',
      },
    },
    '& thead tr th': {
      position: 'sticky',
      top: 0,
      textTransform: 'uppercase',
      padding: '8px 16px',
      background: palette.secondary.main,
      color: palette.text.primary,
      fontWeight: 'normal',
    },
    '& tbody tr.sell td:not(:first-child)': {
      color: palette.error.main,
      '& a': {
        color: palette.error.main,
      },
    },
    '& tbody tr.buy td:not(:first-child)': {
      color: palette.success.main,
      '& a': {
        color: palette.success.main,
      },
    },
    '& tbody tr td': {
      padding: '8px 16px',
      '& a': {
        textDecoration: 'none',
      },
    },
  },
}));

const SwapProChartTrade: React.FC<{
  showChart: boolean;
  showTrades: boolean;
  token1: Token;
  token2: Token;
}> = ({ showChart, showTrades, token1, token2 }) => {
  const classes = useStyles();
  const [transactions, setTransactions] = useState<any[] | undefined>(
    undefined,
  );
  const { chainId } = useActiveWeb3React();

  useEffect(() => {
    async function getTradesData() {
      const transactions = await getSwapTransactions(
        token1.address,
        token2.address,
      );
      setTransactions(transactions);
    }
    getTradesData();
  }, [token1.address, token2.address]);

  const TradesTable = () => (
    <table className={classes.tradeTable} cellSpacing={0}>
      <thead>
        <tr>
          <th align='left'>date</th>
          <th align='left'>type</th>
          <th align='right'>usd</th>
          <th align='right'>{token1.symbol}</th>
          <th align='right'>{token2.symbol}</th>
          <th align='right'>price</th>
          <th align='right'>txn</th>
        </tr>
      </thead>
      {transactions && (
        <tbody>
          {transactions.map((tx, ind) => (
            <tr key={ind} className={Number(tx.amount0In) > 0 ? 'sell' : 'buy'}>
              <td align='left'>
                {moment
                  .unix(tx.transaction.timestamp)
                  .format('MMMM Do h:mm:ss a')}
              </td>
              <td align='left'>{Number(tx.amount0In) > 0 ? 'Sell' : 'Buy'}</td>
              <td align='right'>{formatNumber(tx.amountUSD)}</td>
              <td align='right'>
                {formatNumber(
                  Number(tx.amount0In) > 0 ? tx.amount0In : tx.amount0Out,
                )}
              </td>
              <td align='right'>
                {formatNumber(
                  Number(tx.amount1In) > 0 ? tx.amount1In : tx.amount1Out,
                )}
              </td>
              <td align='right'>111</td>
              <td align='right'>
                {chainId ? (
                  <a
                    href={getEtherscanLink(
                      chainId,
                      tx.transaction.id,
                      'transaction',
                    )}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {shortenTx(tx.transaction.id)}
                  </a>
                ) : (
                  shortenTx(tx.transaction.id)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );

  return showChart && showTrades ? (
    <ReflexContainer orientation='horizontal'>
      <ReflexElement className='top-pane' minSize={200}>
        <SwapProChart />
      </ReflexElement>
      <ReflexSplitter>
        <Box
          width={1}
          height='2px'
          display='flex'
          justifyContent='center'
          alignItems='center'
        >
          <Height />
        </Box>
      </ReflexSplitter>
      <ReflexElement className='bottom-pane' minSize={200}>
        <TradesTable />
      </ReflexElement>
    </ReflexContainer>
  ) : showChart ? (
    <SwapProChart />
  ) : (
    <TradesTable />
  );
};

export default React.memo(SwapProChartTrade);
