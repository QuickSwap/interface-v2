import React, { useState } from 'react';
import { Box, Divider } from '@material-ui/core';
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
          <small className='text-secondary'>Transactions:</small>
          {filteredTxs ? (
            <small>{filteredTxs.length}</small>
          ) : (
            <Skeleton width={60} height={14} />
          )}
        </Box>
        <Divider />
        <Box py={1} display='flex' justifyContent='space-between'>
          <small className='text-secondary'>Buys:</small>
          <small>
            {filteredBuyTxs ? (
              filteredBuyTxs.length
            ) : (
              <Skeleton width={60} height={14} />
            )}
          </small>
        </Box>
        <Divider />
        <Box py={1} display='flex' justifyContent='space-between'>
          <small className='text-secondary'>Sells:</small>
          <small>
            {filteredSellTxs ? (
              filteredSellTxs.length
            ) : (
              <Skeleton width={60} height={14} />
            )}
          </small>
        </Box>
        <Divider />
        <Box pt={1} display='flex' justifyContent='space-between'>
          <small className='text-secondary'>Volume:</small>
          <small>
            {filteredTxs ? (
              volume > 1000 ? (
                formatCompact(volume)
              ) : (
                formatNumber(volume)
              )
            ) : (
              <Skeleton width={60} height={14} />
            )}
          </small>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(SwapInfoTx);
