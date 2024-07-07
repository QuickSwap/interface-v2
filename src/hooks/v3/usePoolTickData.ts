import { Currency } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { PoolState, usePool } from './usePools';
import { useMemo } from 'react';
import computeSurroundingTicks from 'utils/v3/computeSurroundingTicks';
import { FeeAmount, TICK_SPACINGS } from 'v3lib/utils/v3constants';
import { Pool } from 'v3lib/entities/pool';
import { tickToPrice } from 'v3lib/utils/priceTickConversions';
import { useQuery } from '@tanstack/react-query';

const PRICE_FIXED_DIGITS = 8;

// Tick with fields parsed to JSBIs, and active liquidity computed.
export interface TickProcessed {
  tickIdx: number;
  liquidityActive: JSBI;
  liquidityNet: JSBI;
  price0: string;
}

const getActiveTick = (
  tickCurrent: number | undefined,
  feeAmount: FeeAmount | undefined,
) => {
  const tickSpacing = feeAmount ? TICK_SPACINGS[feeAmount] : 60;
  return tickCurrent
    ? Math.floor(tickCurrent / tickSpacing) * tickSpacing
    : undefined;
};

// Fetches all ticks for a given pool
export function useAllV3Ticks(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
) {
  const poolAddress =
    currencyA && currencyB
      ? Pool.getAddress(currencyA?.wrapped, currencyB?.wrapped, feeAmount)
      : undefined;

  //TODO(judo): determine if pagination is necessary for this query
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ['v3-pool-ticks', poolAddress],
    queryFn: async () => {
      if (!poolAddress || !currencyA?.chainId) return null;
      const res = await fetch(
        `${process.env.REACT_APP_LEADERBOARD_APP_URL}/utils/pool-ticks/?address=${poolAddress}&chainId=${currencyA?.chainId}`,
      );
      if (!res.ok) {
        return null;
      }

      const data = await res.json();

      return data?.data?.data ?? null;
    },
    enabled: !!poolAddress && !!currencyA?.chainId,
  });

  return {
    isUninitialized: !poolAddress,
    isLoading,
    isError,
    error,
    ticks: data ?? [],
  };
}

export function usePoolActiveLiquidity(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined,
): {
  isLoading: boolean;
  isUninitialized: boolean;
  isError: boolean;
  error: any;
  activeTick: number | undefined;
  data: TickProcessed[] | undefined;
} {
  const pool = usePool(currencyA, currencyB, feeAmount, !!feeAmount);

  // Find nearest valid tick for pool in case tick is not initialized.
  const activeTick = useMemo(
    () => getActiveTick(pool[1]?.tickCurrent, feeAmount),
    [pool, feeAmount],
  );

  const { isLoading, isUninitialized, isError, error, ticks } = useAllV3Ticks(
    currencyA,
    currencyB,
    feeAmount,
  );

  return useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      activeTick === undefined ||
      pool[0] !== PoolState.EXISTS ||
      !ticks ||
      ticks.length === 0 ||
      isLoading ||
      isUninitialized
    ) {
      return {
        isLoading: isLoading || pool[0] === PoolState.LOADING,
        isUninitialized,
        isError,
        error,
        activeTick,
        data: undefined,
      };
    }

    const token0 = currencyA?.wrapped;
    const token1 = currencyB?.wrapped;

    // find where the active tick would be to partition the array
    // if the active tick is initialized, the pivot will be an element
    // if not, take the previous tick as pivot
    const pivot = ticks.findIndex((tick: any) => tick.tickIdx > activeTick) - 1;

    if (pivot < 0) {
      // consider setting a local error
      console.error('TickData pivot not found');
      return {
        isUninitialized,
        isLoading,
        isError,
        error,
        activeTick,
        data: undefined,
      };
    }

    const activeTickProcessed: TickProcessed = {
      liquidityActive: JSBI.BigInt(pool[1]?.liquidity ?? 0),
      tickIdx: activeTick,
      liquidityNet:
        Number(ticks[pivot].tickIdx) === activeTick
          ? JSBI.BigInt(ticks[pivot].liquidityNet)
          : JSBI.BigInt(0),
      price0: tickToPrice(token0, token1, activeTick).toFixed(
        PRICE_FIXED_DIGITS,
      ),
    };

    const subsequentTicks = computeSurroundingTicks(
      token0,
      token1,
      activeTickProcessed,
      ticks,
      pivot,
      true,
    );

    const previousTicks = computeSurroundingTicks(
      token0,
      token1,
      activeTickProcessed,
      ticks,
      pivot,
      false,
    );

    const ticksProcessed = previousTicks
      .concat(activeTickProcessed)
      .concat(subsequentTicks);

    return {
      isLoading,
      isUninitialized,
      isError: isError,
      error,
      activeTick,
      data: ticksProcessed,
    };
  }, [
    currencyA,
    currencyB,
    activeTick,
    pool,
    ticks,
    isLoading,
    isUninitialized,
    isError,
    error,
  ]);
}
