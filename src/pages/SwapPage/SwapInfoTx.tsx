import React, { useState } from 'react';
import { Box, Typography, Divider } from '@material-ui/core';
import { ButtonSwitch } from 'components';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Skeleton from '@material-ui/lab/Skeleton';
import { formatCompact, formatNumber } from 'utils';
dayjs.extend(utc);

const SwapInfoTx: React.FC<{
  transactions?: any[];
}> = ({ transactions }) => {
  const [txFilter, setTxFilter] = useState('5_minute');
  const subtractTimeAmount = Number(txFilter.split('_')[0]);
  const subtractTimeType = txFilter.split('_')[1];
  const currentTime = dayjs.utc();
  const firstTime = currentTime
    .subtract(subtractTimeAmount, subtractTimeType)
    .unix();

  const filteredTxs = transactions?.filter(
    (tx) => tx.transaction.timestamp >= firstTime,
  );
  const filteredBuyTxs = filteredTxs?.filter((tx) => Number(tx.amount1In) > 0);
  const filteredSellTxs = filteredTxs?.filter((tx) => Number(tx.amount0In) > 0);
  const volume = filteredTxs
    ? filteredTxs.reduce((total, tx) => total + Number(tx.amountUSD), 0)
    : undefined;

  return (
    <>
      <ButtonSwitch
        height={32}
        value={txFilter}
        onChange={setTxFilter}
        items={[
          { label: '5m', value: '5_minute' },
          { label: '1h', value: '1_hour' },
          { label: '6h', value: '6_hour' },
          { label: '24h', value: '24_hour' },
        ]}
      />
      <Box pt={1} px={1}>
        <Box py={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Transactions:
          </Typography>
          {filteredTxs ? (
            <Typography variant='body2'>{filteredTxs.length}</Typography>
          ) : (
            <Skeleton width={60} height={14} />
          )}
        </Box>
        <Divider />
        <Box py={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Buys:
          </Typography>
          <Typography variant='body2'>
            {filteredBuyTxs ? (
              <Typography variant='body2'>{filteredBuyTxs.length}</Typography>
            ) : (
              <Skeleton width={60} height={14} />
            )}
          </Typography>
        </Box>
        <Divider />
        <Box py={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Sells:
          </Typography>
          <Typography variant='body2'>
            {filteredSellTxs ? (
              <Typography variant='body2'>{filteredSellTxs.length}</Typography>
            ) : (
              <Skeleton width={60} height={14} />
            )}
          </Typography>
        </Box>
        <Divider />
        <Box pt={1} display='flex' justifyContent='space-between'>
          <Typography variant='body2' color='textSecondary'>
            Volume:
          </Typography>
          <Typography variant='body2'>
            {filteredTxs ? (
              <Typography variant='body2'>
                ${volume > 1000 ? formatCompact(volume) : formatNumber(volume)}
              </Typography>
            ) : (
              <Skeleton width={60} height={14} />
            )}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(SwapInfoTx);
