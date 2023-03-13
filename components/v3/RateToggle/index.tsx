import React from 'react';
import { Currency } from '@uniswap/sdk-core';
import Toggle from '../Toggle';

interface RateToggleProps {
  currencyA: Currency;
  currencyB: Currency;
  handleRateToggle: () => void;
}

export default function RateToggle({
  currencyA,
  currencyB,
  handleRateToggle,
}: RateToggleProps) {
  const tokenA = currencyA?.wrapped;
  const tokenB = currencyB?.wrapped;

  const isSorted = tokenA && tokenB && tokenA.sortsBefore(tokenB);

  return tokenA && tokenB ? (
    <Toggle
      isActive={isSorted}
      toggle={handleRateToggle}
      checked={isSorted ? tokenA.symbol : tokenB.symbol}
      unchecked={isSorted ? tokenB.symbol : tokenA.symbol}
    />
  ) : null;
}
