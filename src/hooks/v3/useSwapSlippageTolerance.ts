import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/src/trade';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { useMemo } from 'react';
import { useUserSlippageToleranceWithDefault } from 'state/user/v3/hooks';

const V3_SWAP_DEFAULT_SLIPPAGE = new Percent(50, 10_000); // .50%
const ONE_TENTHS_PERCENT = new Percent(10, 10_000); // .10%

export default function useSwapSlippageTolerance(
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | undefined,
): Percent {
  const defaultSlippageTolerance = useMemo(() => {
    if (!trade) return ONE_TENTHS_PERCENT;
    return V3_SWAP_DEFAULT_SLIPPAGE;
  }, [trade]);
  return useUserSlippageToleranceWithDefault(defaultSlippageTolerance);
}
