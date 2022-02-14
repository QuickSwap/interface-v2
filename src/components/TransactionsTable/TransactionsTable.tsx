import React, { useState } from 'react';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { CustomTable } from 'components';
import { formatNumber, getEtherscanLink, shortenTx } from 'utils';
import { useActiveWeb3React } from 'hooks';
import moment from 'moment';

const useStyles = makeStyles(({}) => ({
  priceChangeWrapper: {
    height: 25,
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  mobileRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '8px 0',
  },
}));

interface TransactionsTableProps {
  data: any[];
}

const headCells = (
  txFilter: string,
  setTxFilter: (txFilter: string) => void,
) => [
  {
    id: 'description',
    numeric: false,
    label: (
      <Box display='flex' alignItems='center'>
        <Typography
          variant='body2'
          color={txFilter === '' ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter('')}
        >
          All
        </Typography>
        <Typography
          variant='body2'
          color={txFilter === 'Swap' ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter('Swap')}
          style={{ marginLeft: 12 }}
        >
          Swap
        </Typography>
        <Typography
          variant='body2'
          color={txFilter === 'Add' ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter('Add')}
          style={{ marginLeft: 12 }}
        >
          Add
        </Typography>
        <Typography
          variant='body2'
          color={txFilter === 'Remove' ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter('Remove')}
          style={{ marginLeft: 12 }}
        >
          Remove
        </Typography>
      </Box>
    ),
    sortDisabled: true,
  },
  {
    id: 'totalvalue',
    numeric: false,
    label: 'Total Value',
    sortKey: (item: any) => Number(item.amountUSD),
  },
  {
    id: 'tokenamount1',
    numeric: false,
    label: 'Token Amount',
    sortKey: (item: any) => Number(item.amount1),
  },
  {
    id: 'tokenamount2',
    numeric: false,
    label: 'Token Amount',
    sortKey: (item: any) => Number(item.amount0),
  },
  {
    id: 'txn',
    numeric: false,
    label: 'TXN',
    sortKey: (item: any) => item.transaction.id,
  },
  {
    id: 'time',
    numeric: false,
    label: 'Time',
    sortKey: (item: any) => Number(item.transaction.timestamp) * -1,
  },
];

const TransactionsTable: React.FC<TransactionsTableProps> = ({ data }) => {
  const [txFilter, setTxFilter] = useState('');
  const txHeadCells = headCells(txFilter, setTxFilter);
  const classes = useStyles();
  const { chainId } = useActiveWeb3React();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const getTxString = (txn: any) => {
    return `${txn.type} ${txn.pair.token0.symbol} ${
      txn.type === 'Swap' ? 'for' : 'and'
    } ${txn.pair.token1.symbol}`;
  };
  const getTxAmount0String = (txn: any) => {
    const token = txn.type === 'Swap' ? txn.pair.token1 : txn.pair.token0;
    return `${formatNumber(txn.amount0)} ${token.symbol}`;
  };
  const getTxAmount1String = (txn: any) => {
    const token = txn.type === 'Swap' ? txn.pair.token0 : txn.pair.token1;
    return `${formatNumber(txn.amount1)} ${token.symbol}`;
  };
  const mobileHTML = (txn: any, index: number) => {
    return (
      <Box mt={index === 0 ? 0 : 3} key={index}>
        <Box mb={1}>
          {chainId ? (
            <a
              href={getEtherscanLink(
                chainId,
                txn.transaction.id,
                'transaction',
              )}
              target='_blank'
              rel='noreferrer'
              style={{ textDecoration: 'none' }}
            >
              <Typography
                variant='body1'
                style={{ color: palette.primary.main }}
              >
                {getTxString(txn)}
              </Typography>
            </a>
          ) : (
            <Typography variant='body1' style={{ color: palette.primary.main }}>
              {getTxString(txn)}
            </Typography>
          )}
        </Box>
        <Divider />
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Total Value</Typography>
          <Typography variant='body1' color='textPrimary'>
            ${Number(txn.amountUSD).toLocaleString()}
          </Typography>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Token Amount</Typography>
          <Typography variant='body1' color='textPrimary'>
            {getTxAmount1String(txn)}
          </Typography>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Token Amount</Typography>
          <Typography variant='body1' color='textPrimary'>
            {getTxAmount0String(txn)}
          </Typography>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>TXN</Typography>
          {chainId ? (
            <a
              href={getEtherscanLink(
                chainId,
                txn.transaction.id,
                'transaction',
              )}
              target='_blank'
              rel='noreferrer'
              style={{ textDecoration: 'none' }}
            >
              <Typography
                variant='body1'
                style={{ color: palette.primary.main }}
              >
                {shortenTx(txn.transaction.id)}
              </Typography>
            </a>
          ) : (
            <Typography variant='body1' style={{ color: palette.primary.main }}>
              {shortenTx(txn.transaction.id)}
            </Typography>
          )}
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Time</Typography>
          <Typography variant='body1' color='textPrimary'>
            {moment(Number(txn.transaction.timestamp) * 1000).fromNow()}
          </Typography>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (txn: any) => {
    return [
      {
        html: chainId ? (
          <a
            href={getEtherscanLink(chainId, txn.transaction.id, 'transaction')}
            target='_blank'
            rel='noreferrer'
            style={{ textDecoration: 'none' }}
          >
            <Typography variant='body1' style={{ color: palette.primary.main }}>
              {getTxString(txn)}
            </Typography>
          </a>
        ) : (
          <Typography variant='body1' style={{ color: palette.primary.main }}>
            {getTxString(txn)}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1' color='textPrimary'>
            ${Number(txn.amountUSD).toLocaleString()}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1' color='textPrimary'>
            {getTxAmount1String(txn)}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1' color='textPrimary'>
            {getTxAmount0String(txn)}
          </Typography>
        ),
      },
      {
        html: chainId ? (
          <a
            href={getEtherscanLink(chainId, txn.transaction.id, 'transaction')}
            target='_blank'
            rel='noreferrer'
            style={{ textDecoration: 'none' }}
          >
            <Typography variant='body1' style={{ color: palette.primary.main }}>
              {shortenTx(txn.transaction.id)}
            </Typography>
          </a>
        ) : (
          <Typography variant='body1' style={{ color: palette.primary.main }}>
            {shortenTx(txn.transaction.id)}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1' color='textPrimary'>
            {moment(Number(txn.transaction.timestamp) * 1000).fromNow()}
          </Typography>
        ),
      },
    ];
  };

  return (
    <Box position='relative'>
      {isMobile && (
        <Box
          display='flex'
          alignItems='center'
          position='absolute'
          top={-48}
          right={0}
        >
          <Box padding={1} onClick={() => setTxFilter('')}>
            <Typography
              variant='body1'
              color={txFilter === '' ? 'textPrimary' : 'textSecondary'}
            >
              All
            </Typography>
          </Box>
          <Box padding={1} onClick={() => setTxFilter('Swap')}>
            <Typography
              variant='body1'
              color={txFilter === 'Swap' ? 'textPrimary' : 'textSecondary'}
            >
              Swap
            </Typography>
          </Box>
          <Box padding={1} onClick={() => setTxFilter('Add')}>
            <Typography
              variant='body1'
              color={txFilter === 'Add' ? 'textPrimary' : 'textSecondary'}
            >
              Add
            </Typography>
          </Box>
          <Box padding={1} onClick={() => setTxFilter('Remove')}>
            <Typography
              variant='body1'
              color={txFilter === 'Remove' ? 'textPrimary' : 'textSecondary'}
            >
              Remove
            </Typography>
          </Box>
        </Box>
      )}
      <CustomTable
        showPagination={data.length > 10}
        headCells={txHeadCells}
        defaultOrderBy={txHeadCells[5]}
        rowsPerPage={10}
        data={data.filter((item) =>
          txFilter === '' ? true : item.type === txFilter,
        )}
        mobileHTML={mobileHTML}
        desktopHTML={desktopHTML}
      />
    </Box>
  );
};

export default TransactionsTable;
