import React from 'react';
import { Currency, Price } from '@uniswap/sdk-core';

export function getRatio(
  lower: Price<Currency, Currency>,
  current: Price<Currency, Currency>,
  upper: Price<Currency, Currency>,
) {
  try {
    if (!current.greaterThan(lower)) {
      return 100;
    } else if (!current.lessThan(upper)) {
      return 0;
    }

    const a = Number.parseFloat(lower.toSignificant(15));
    const b = Number.parseFloat(upper.toSignificant(15));
    const c = Number.parseFloat(current.toSignificant(15));

    const ratio = Math.floor(
      (1 /
        ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) *
        100,
    );

    if (ratio < 0 || ratio > 100) {
      throw Error('Out of range');
    }

    return ratio;
  } catch {
    return undefined;
  }
}
