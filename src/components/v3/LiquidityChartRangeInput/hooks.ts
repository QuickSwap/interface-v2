import { useCallback, useMemo } from 'react';
import { Currency } from '@uniswap/sdk-core';
import { FeeAmount } from 'lib/src/constants';

import { ChartEntry } from './types';
import JSBI from 'jsbi';
import { PriceFormats } from '../PriceFomatToggler';
import { usePoolActiveLiquidity } from 'hooks/v3/usePoolTickData';
import useUSDCPrice from 'hooks/v3/useUSDCPrice';

export interface TickProcessed {
  liquidityActive: JSBI;
  price0: string;
}

export function useDensityChartData({
  currencyA,
  currencyB,
  feeAmount,
  priceFormat,
}: {
  currencyA: Currency | undefined;
  currencyB: Currency | undefined;
  feeAmount: FeeAmount | undefined;
  priceFormat: PriceFormats;
}) {
  const {
    isLoading,
    isUninitialized,
    isError,
    error,
    data,
  } = usePoolActiveLiquidity(currencyA, currencyB, feeAmount);

  const currencyBUSD = useUSDCPrice(currencyB);

  const formatData = useCallback(() => {
    if (!data?.length) {
      return undefined;
    }

    if (priceFormat === PriceFormats.USD && !currencyBUSD) return;

    const newData: ChartEntry[] = [];

    for (let i = 0; i < data.length; i++) {
      const t: TickProcessed = data[i];

      const formattedPrice =
        priceFormat === PriceFormats.USD && currencyBUSD
          ? parseFloat(t.price0) * +currencyBUSD.toSignificant(5)
          : parseFloat(t.price0);

      const chartEntry = {
        activeLiquidity: parseFloat(t.liquidityActive.toString()),
        price0: formattedPrice,
      };

      if (chartEntry.activeLiquidity > 0) {
        newData.push(chartEntry);
      }
    }

    return newData;
  }, [data, currencyBUSD, priceFormat]);

  return useMemo(() => {
    return {
      isLoading,
      isUninitialized,
      isError,
      error,
      formattedData: !isLoading && !isUninitialized ? formatData() : undefined,
    };
  }, [isLoading, isUninitialized, isError, error, formatData]);
}
