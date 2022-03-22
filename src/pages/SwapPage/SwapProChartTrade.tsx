import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SwapProChart from './SwapProChart';
import { Token } from '@uniswap/sdk';
import { Box } from '@material-ui/core';
import { Height } from '@material-ui/icons';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import 'react-reflex/styles.css';
import { formatNumber, shortenTx, getEtherscanLink } from 'utils';
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
  transactions?: any[];
}> = ({ showChart, showTrades, token1, token2, transactions }) => {
  const classes = useStyles();

  const { chainId } = useActiveWeb3React();

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
          {transactions.map((tx, ind) => {
            const txType = Number(tx.amount0In) > 0 ? 'sell' : 'buy';
            const txAmount0 =
              Number(tx.amount0In) > 0 ? tx.amount0In : tx.amount0Out;
            const txAmount1 =
              Number(tx.amount1In) > 0 ? tx.amount1In : tx.amount1Out;
            const token1Amount =
              tx.pair.token0.id.toLowerCase() === token1.address.toLowerCase()
                ? txAmount0
                : txAmount1;
            const token2Amount =
              tx.pair.token0.id.toLowerCase() === token1.address.toLowerCase()
                ? txAmount1
                : txAmount0;
            const txPrice = Number(tx.amountUSD) / txAmount1;
            return (
              <tr key={ind} className={txType}>
                <td align='left'>
                  {moment
                    .unix(tx.transaction.timestamp)
                    .format('MMMM Do h:mm:ss a')}
                </td>
                <td align='left'>{txType.toUpperCase()}</td>
                <td align='right'>{formatNumber(tx.amountUSD)}</td>
                <td align='right'>{formatNumber(token1Amount)}</td>
                <td align='right'>{formatNumber(token2Amount)}</td>
                <td align='right'>{formatNumber(txPrice)}</td>
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
            );
          })}
        </tbody>
      )}
    </table>
  );

  return (
    <ReflexContainer orientation='horizontal'>
      {showChart && (
        <ReflexElement className='top-pane' minSize={200}>
          <SwapProChart />
        </ReflexElement>
      )}
      {showChart && showTrades && (
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
      )}
      {showTrades && (
        <ReflexElement className='bottom-pane' minSize={200}>
          <TradesTable />
        </ReflexElement>
      )}
    </ReflexContainer>
  );
};

export default React.memo(SwapProChartTrade);
