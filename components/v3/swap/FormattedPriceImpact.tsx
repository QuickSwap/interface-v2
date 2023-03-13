import React from 'react';
import { Percent } from '@uniswap/sdk-core';
import { warningSeverity } from 'utils/v3/prices';

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
    <small
      className={
        severity === 3 || severity === 4
          ? 'text-error'
          : severity === 2
          ? 'text-yellow'
          : severity === 1
          ? 'text-blueviolet'
          : 'text-success'
      }
    >
      {priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : '-'}
    </small>
  );
}
