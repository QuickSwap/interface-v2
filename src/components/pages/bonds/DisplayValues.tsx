import { useActiveWeb3React } from 'hooks';
import React from 'react';
import { useTranslation } from 'next-i18next';
import { Box } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';

const DisplayValues = ({
  bond,
  consideredValue,
}: {
  bond?: any;
  consideredValue: number;
}) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();

  // Bond Data
  const {
    price,
    earnToken,
    maxTotalPayOut,
    totalPayoutGiven,
    earnTokenPrice,
    maxPayoutTokens,
  } = bond ?? {};

  const bondPrice = Number(formatUnits(price ?? 0));
  const billValue = bondPrice > 0 ? consideredValue / bondPrice : 0;
  const bondMaxTotalPayout = Number(
    formatUnits(maxTotalPayOut ?? '0', earnToken?.decimals?.[chainId] ?? 18),
  );
  const bondTotalPayoutGiven = Number(
    formatUnits(totalPayoutGiven ?? '0', earnToken?.decimals?.[chainId] ?? 18),
  );
  const available = bondMaxTotalPayout - bondTotalPayoutGiven;
  // threshold is the usd amount used to obtain a safeAvailable value to used as max bond Limit
  const threshold = 5;
  const bondEarnTokenPrice = Number(earnTokenPrice ?? 0);
  const thresholdToShow =
    bondEarnTokenPrice > 0 ? threshold / bondEarnTokenPrice : 0;
  const safeAvailable = available - thresholdToShow;
  const singlePurchaseLimit = Number(
    formatUnits(maxPayoutTokens ?? '0', earnToken?.decimals?.[chainId] ?? 18),
  );
  const displayAvailable =
    singlePurchaseLimit < safeAvailable ? singlePurchaseLimit : safeAvailable;
  const exceedsAvailable = displayAvailable < billValue;

  return (
    <Box my='12px' className='flex justify-between'>
      <small>
        {t('bondValue')}:{' '}
        <span
          className='small font-bold'
          style={{ fontWeight: 700, color: exceedsAvailable ? 'red' : 'unset' }}
        >
          {isNaN(billValue) ? '0' : billValue?.toLocaleString(undefined)}{' '}
          {earnToken?.symbol}
        </span>
      </small>
      <small>
        {t('Max per Bond')}:{' '}
        {!available
          ? '0'
          : parseFloat(displayAvailable.toString())?.toLocaleString(
              undefined,
            )}{' '}
        {earnToken?.symbol}
      </small>
    </Box>
  );
};

export default React.memo(DisplayValues);
