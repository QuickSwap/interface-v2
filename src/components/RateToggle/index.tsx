import React from 'react';
import { Currency, Token, ETHER, TokenAmount } from '@uniswap/sdk';
import { ToggleElement, ToggleWrapper } from 'components/Toggle/MultiToggle';

// the order of displayed base currencies from left to right is always in sort order
// currencyA is treated as the preferred base currency
export default function RateToggle({
  currencyA,
  currencyB,
  handleRateToggle,
}: {
  currencyA: { symbol: string };
  currencyB: { symbol: string };
  handleRateToggle: () => void;
}) {
  // const tokenA = currencyA?.wrapped;
  // const tokenB = currencyB?.wrapped;

  const isSorted = true; //tokenA && tokenB && tokenA.sortsBefore(tokenB);

  return currencyA && currencyB ? (
    <div
      style={{ width: 'fit-content', display: 'flex', alignItems: 'center' }}
      onClick={handleRateToggle}
    >
      <ToggleWrapper width='fit-content'>
        <ToggleElement isActive={isSorted} fontSize='12px'>
          <div>{isSorted ? currencyA.symbol : currencyB.symbol}</div>
        </ToggleElement>
        <ToggleElement isActive={!isSorted} fontSize='12px'>
          <div>{isSorted ? currencyB.symbol : currencyA.symbol}</div>
        </ToggleElement>
      </ToggleWrapper>
    </div>
  ) : null;
}
