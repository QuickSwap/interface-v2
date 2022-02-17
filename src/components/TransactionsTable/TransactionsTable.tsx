import React, { useState } from 'react';
import { Box, Typography, Divider, useMediaQuery } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { CustomTable } from 'components';
import { formatNumber, getEtherscanLink, shortenTx } from 'utils';
import { useActiveWeb3React } from 'hooks';
import moment from 'moment';
import { TxnType } from 'constants/index';

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
  txFilter: number,
  setTxFilter: (txFilter: number) => void,
) => [
  {
    id: 'description',
    numeric: false,
    label: (
      <Box display='flex' alignItems='center'>
        <Typography
          variant='body2'
          color={txFilter === -1 ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter(-1)}
        >
          All
        </Typography>
        <Typography
          variant='body2'
          color={txFilter === TxnType.SWAP ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter(TxnType.SWAP)}
          style={{ marginLeft: 12 }}
        >
          Swap
        </Typography>
        <Typography
          variant='body2'
          color={txFilter === TxnType.ADD ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter(TxnType.ADD)}
          style={{ marginLeft: 12 }}
        >
          Add
        </Typography>
        <Typography
          variant='body2'
          color={txFilter === TxnType.REMOVE ? 'textPrimary' : 'textSecondary'}
          onClick={() => setTxFilter(TxnType.REMOVE)}
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
  const [txFilter, setTxFilter] = useState(-1);
  const txHeadCells = headCells(txFilter, setTxFilter);
  const classes = useStyles();
  const { chainId } = useActiveWeb3React();
  const { palette, breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));
  const { t } = useTranslation();
  const getTxString = (txn: any) => {
    const messageData = {
      token0Symbol: txn.pair.token1.symbol,
      token1Symbol: txn.pair.token0.symbol,
    };
    if (txn.type === TxnType.SWAP) {
      return t('txnSwapMessage', messageData);
    } else if (txn.type === TxnType.ADD) {
      return t('txnAddMessage', messageData);
    } else if (txn.type === TxnType.REMOVE) {
      return t('txnRemoveMessage', messageData);
    }
    return '';
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
            {formatNumber(txn.amount0)} {txn.pair.token0.symbol}
          </Typography>
        </Box>
        <Box className={classes.mobileRow}>
          <Typography variant='body1'>Token Amount</Typography>
          <Typography variant='body1' color='textPrimary'>
            {formatNumber(txn.amount1)} {txn.pair.token1.symbol}
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
            {formatNumber(txn.amount1)} {txn.pair.token1.symbol}
          </Typography>
        ),
      },
      {
        html: (
          <Typography variant='body1' color='textPrimary'>
            {formatNumber(txn.amount0)} {txn.pair.token0.symbol}
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
          <Box padding={1} onClick={() => setTxFilter(-1)}>
            <Typography
              variant='body1'
              color={txFilter === -1 ? 'textPrimary' : 'textSecondary'}
            >
              All
            </Typography>
          </Box>
          <Box padding={1} onClick={() => setTxFilter(TxnType.SWAP)}>
            <Typography
              variant='body1'
              color={
                txFilter === TxnType.SWAP ? 'textPrimary' : 'textSecondary'
              }
            >
              Swap
            </Typography>
          </Box>
          <Box padding={1} onClick={() => setTxFilter(TxnType.ADD)}>
            <Typography
              variant='body1'
              color={txFilter === TxnType.ADD ? 'textPrimary' : 'textSecondary'}
            >
              Add
            </Typography>
          </Box>
          <Box padding={1} onClick={() => setTxFilter(TxnType.REMOVE)}>
            <Typography
              variant='body1'
              color={
                txFilter === TxnType.REMOVE ? 'textPrimary' : 'textSecondary'
              }
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
          txFilter === -1 ? true : item.type === txFilter,
        )}
        mobileHTML={mobileHTML}
        desktopHTML={desktopHTML}
      />
    </Box>
  );
};

export default TransactionsTable;
