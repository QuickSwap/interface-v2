import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core';
import React, { useMemo } from 'react';
import { TYPE } from 'theme/index';
import { warningSeverity } from 'utils/v3/prices';
import { useTheme } from 'styled-components';
import HoverInlineText from '../HoverInlineText';

interface FiatValueProps {
  fiatValue: CurrencyAmount<Currency> | null | undefined;
  priceImpact?: Percent;
}

export function FiatValue({ fiatValue, priceImpact }: FiatValueProps) {
  const theme = useTheme();
  const priceImpactColor = useMemo(() => {
    if (!priceImpact) return undefined;
    if (priceImpact.lessThan('0')) return theme.green1;
    const severity = warningSeverity(priceImpact);
    if (severity < 1) return 'white';
    if (severity < 3) return theme.yellow1;
    return theme.red1;
  }, [priceImpact, theme.green1, theme.red1, theme.yellow1]);

  return (
    <TYPE.body fontSize={14} color={fiatValue ? 'white' : 'white'}>
      {fiatValue ? (
        <HoverInlineText
          text={'~$ ' + fiatValue?.toSignificant(6, { groupSeparator: ',' })}
        />
      ) : (
        "Can't estimate price"
      )}
      {priceImpact ? (
        <span style={{ color: priceImpactColor }}>
          {' '}
          ({priceImpact.multiply(-1).toSignificant(3)}%)
        </span>
      ) : null}
    </TYPE.body>
  );
}
