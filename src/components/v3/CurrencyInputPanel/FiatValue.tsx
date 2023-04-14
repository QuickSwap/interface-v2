import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import React, { useMemo } from 'react';
import { warningSeverity } from 'utils/v3/prices';
import HoverInlineText from '../HoverInlineText';

interface FiatValueProps {
  fiatValue: CurrencyAmount<Currency> | null | undefined;
  priceImpact?: Percent;
}

export function FiatValue({ fiatValue, priceImpact }: FiatValueProps) {
  const priceImpactClass = useMemo(() => {
    if (!priceImpact) return undefined;
    if (priceImpact.lessThan('0')) return 'text-success';
    const severity = warningSeverity(priceImpact);
    if (severity < 1) return 'text-white';
    if (severity < 3) return 'text-yellow';
    return 'text-error';
  }, [priceImpact]);

  return (
    <p className='text-white'>
      {fiatValue ? (
        <HoverInlineText
          text={'~$ ' + fiatValue?.toSignificant(6, { groupSeparator: ',' })}
        />
      ) : (
        "Can't estimate price"
      )}
      {priceImpact ? (
        <span className={priceImpactClass}>
          {' '}
          ({priceImpact.multiply(-1).toSignificant(3)}%)
        </span>
      ) : null}
    </p>
  );
}
