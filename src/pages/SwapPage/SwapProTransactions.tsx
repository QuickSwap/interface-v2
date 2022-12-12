import { Box, Divider, useMediaQuery, useTheme } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { CustomTable } from 'components';
import { GlobalConst } from 'constants/index';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from 'utils';

interface SwapProTransactionsProps {
  data: any[];
}

const SwapProTransactions: React.FC<SwapProTransactionsProps> = ({
  data = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));

  const [symbol1, setSymbol1] = useState('');
  const [symbol2, setSymbol2] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    // console.log('Transactions => ', data);
    if (Array.isArray(data) && data.length > 0) {
      const sample = data[0];
      const token0 = sample.pair.token0;
      const token1 = sample.pair.token1;
      setSymbol1(sample.pair.token0.symbol);
      setSymbol2(sample.pair.token1.symbol);

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
      });

      const result: any[] = mobileWindowSize ? data.slice(0, 20) : data;
      setFilteredData(result);
    }
  }, [data, mobileWindowSize]);

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

  const mobileHTML = (txn: any, index: number) => {
    return (
      <Box my={1} mx='0.5rem'>
        <Divider />
        <Box className='mobileRow'>
          <Box>{`${t('Price')} (${symbol1})`}</Box>
          <Box className={txn.txType}>{formatNumber(txn.token1Amount)}</Box>
        </Box>
        <Box className='mobileRow'>
          <Box>{`${t('Amount')} (${symbol2})`}</Box>
          <Box>{formatNumber(txn.token2Amount)}</Box>
        </Box>
        <Box className='mobileRow'>
          <Box>{t('Time')}</Box>
          <Box>
            {new Date(txn.transaction.timestamp * 1000).toLocaleTimeString()}
          </Box>
        </Box>
      </Box>
    );
  };

  const desktopHTML = (txn: any) => {
    return [
      {
        html: (
          <Box className={txn.txType}>{formatNumber(txn.token1Amount)}</Box>
        ),
      },
      {
        html: <Box>{formatNumber(txn.token2Amount)}</Box>,
      },
      {
        html: (
          <Box mr={2}>
            {new Date(txn.transaction.timestamp * 1000).toLocaleTimeString()}
            {/* {dayjs(Number(txn.transaction.timestamp) * 1000).fromNow()} */}
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
      <Box className='panel'>
        {data ? (
          <CustomTable
            defaultOrderBy={tokenHeadCells[1]}
            defaultOrder='desc'
            headCells={tokenHeadCells}
            rowsPerPage={GlobalConst.utils.ROWSPERPAGE}
            data={filteredData}
            desktopHTML={desktopHTML}
            mobileHTML={mobileHTML}
          />
        ) : (
          <Skeleton variant='rect' width={'100%'} height={150}></Skeleton>
        )}
      </Box>
    </Box>
  );
};

export default SwapProTransactions;
