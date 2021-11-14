import { Typography } from '@material-ui/core';
import { Percent } from '@uniswap/sdk';
import React from 'react';
import { ONE_BIPS } from '../../constants';
import { warningSeverity } from '../../utils/prices';

/**
 * Formatted version of price impact text with warning colors
 */
export default function FormattedPriceImpact({
  priceImpact,
}: {
  priceImpact?: Percent;
}) {
  const severity = warningSeverity(priceImpact);
  return (
    <Typography
      variant='body2'
      style={{
        color:
          severity === 3 || severity === 4
            ? 'red'
            : severity === 2
            ? 'yellow'
            : severity === 1
            ? 'black'
            : '#0fc679',
      }}
    >
      {priceImpact
        ? priceImpact.lessThan(ONE_BIPS)
          ? '<0.01%'
          : `${priceImpact.toFixed(2)}%`
        : '-'}
    </Typography>
  );
}
