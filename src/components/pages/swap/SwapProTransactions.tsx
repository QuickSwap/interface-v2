import { Box, Divider, useMediaQuery, useTheme } from '@mui/material';
import { Skeleton } from '@mui/lab';
import { CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import { useActiveWeb3React } from 'hooks';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { formatNumber, getEtherscanLink } from 'utils';
import dayjs from 'dayjs';

interface SwapProTransactionsProps {
  data: any[];
}

const SwapProTransactions: React.FC<SwapProTransactionsProps> = ({
  data = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const { chainId } = useActiveWeb3React();
  const [symbol1, setSymbol1] = useState('');
  const [symbol2, setSymbol2] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const sample = data[0];
      const token0 = sample.pair.token0;
      const token1 = sample.pair.token1;
      setSymbol1(token0.symbol);
      setSymbol2(token1.symbol);

      data.forEach((tx) => {
        const txType = Number(tx.amount0In) > 0 ? 'sell' : 'buy';
        const txAmount0 =
          Number(tx.amount0In) > 0 ? tx.amount0In : tx.amount0Out;
        const txAmount1 =
          Number(tx.amount1In) > 0 ? tx.amount1In : tx.amount1Out;
        const token1Amount =
          tx.pair.token0.id.toLowerCase() === token1.id.toLowerCase()
            ? txAmount0
            : txAmount1;
        const token2Amount =
          tx.pair.token0.id.toLowerCase() === token1.id.toLowerCase()
            ? txAmount1
            : txAmount0;
        const txPrice = Number(tx.amountUSD) / token1Amount;

        tx.txType = txType;
        tx.token1Amount = token1Amount;
        tx.token2Amount = token2Amount;
        tx.txPrice = txPrice;
        tx.timestamp = dayjs(Number(tx.transaction.timestamp) * 1000).fromNow();

        const { transaction } = tx;

        tx.link =
          chainId && transaction
            ? getEtherscanLink(chainId, transaction.id, 'transaction')
            : undefined;
      });

      const result: any[] = mobileWindowSize ? data.slice(0, 20) : data;
      setFilteredData(result);
    }
  }, [data, chainId, mobileWindowSize]);

  const tokenHeadCells = [
    {
      id: 'price',
      numeric: false,
      label: `${t('Price')} (${symbol1})`,
      sortDisabled: true,
    },
    {
      id: 'amount',
      numeric: false,
      label: `${t('Amount')} (${symbol2})`,
      sortDisabled: true,
    },
    {
      id: 'time',
      numeric: false,
      label: t('Time'),
      sortDisabled: true,
    },
  ];

  const mobileHTML = (txn: any) => {
    return (
      <Box
        my={1}
        mx='0.5rem'
        className='cursor-pointer'
        onClick={() => {
          if (txn.link) {
            window.open(txn.link, '_blank');
          }
        }}
      >
        <Divider />
        <Box className='mobileRow'>
          <Box>{`${t('Price')} (${symbol1})`}</Box>
          <Box className={txn.txType === 'buy' ? 'text-success' : 'text-error'}>
            {formatNumber(txn.token1Amount)}
          </Box>
        </Box>
        <Box className='mobileRow'>
          <Box>{`${t('Amount')} (${symbol2})`}</Box>
          <Box>{formatNumber(txn.token2Amount)}</Box>
        </Box>
        <Box className='mobileRow'>
          <Box>{t('Time')}</Box>
          <Box>{txn.timestamp}</Box>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (txn: any) => {
    const txnClass = txn.txType === 'buy' ? 'text-success' : 'text-error';
    return [
      {
        html: (
          <Box
            className={`${txnClass} cursor-pointer`}
            onClick={() => {
              if (txn.link) {
                window.open(txn.link, '_blank');
              }
            }}
          >
            {formatNumber(txn.token2Amount)}
          </Box>
        ),
      },
      {
        html: (
          <Box
            className={`${txnClass} cursor-pointer`}
            onClick={() => {
              if (txn.link) {
                window.open(txn.link, '_blank');
              }
            }}
          >
            {formatNumber(txn.token1Amount)}
          </Box>
        ),
      },
      {
        html: (
          <Box
            className={`${txnClass} cursor-pointer`}
            mr={2}
            onClick={() => {
              if (txn.link) {
                window.open(txn.link, '_blank');
              }
            }}
          >
            {txn.timestamp}
          </Box>
        ),
      },
    ];
  };

  return (
    <Box className='flex flex-col'>
      <p className='weight-600 text-secondary text-uppercase'>
        {t('Transactions')}
      </p>

      {/** Table */}
      <Box mt={2}>
        {data ? (
          <CustomTable
            defaultOrderBy={tokenHeadCells[2]}
            defaultOrder='desc'
            headCells={tokenHeadCells}
            rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
            data={filteredData}
            desktopHTML={desktopHTML}
            mobileHTML={mobileHTML}
          />
        ) : (
          <Skeleton variant='rectangular' width={'100%'} height={150} />
        )}
      </Box>
    </Box>
  );
};

export default SwapProTransactions;
