import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core';

import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useAllV3Routes } from './useAllV3Routes';
import { useSingleContractMultipleData } from 'state/multicall/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { useUniV3Quoter, useV3Quoter } from 'hooks/useContract';
import { Route } from 'v3lib/entities/route';
import { Trade } from 'lib/src/trade';
import { encodeRouteToPath } from 'v3lib/utils/encodeRouteToPath';
import { ChainId } from '@uniswap/sdk';

export enum V3TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

const QUOTE_GAS_OVERRIDES: { [chainId: number]: number } = {
  [ChainId.ZKEVM]: 20_000_000,
  [ChainId.ASTARZKEVM]: 100_000_000,
  [ChainId.MANTA]: 20_000_000,
};

const DEFAULT_GAS_QUOTE = 2_000_000;

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestV3TradeExactIn(
  amountIn?: CurrencyAmount<Currency>,
  currencyOut?: Currency,
): {
  state: V3TradeState;
  trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null;
} {
  const { chainId } = useActiveWeb3React();
  const quoter = useV3Quoter();
  const uniQuoter = useUniV3Quoter();

  const {
    routes: algebraRoutes,
    loading: algebraRoutesLoading,
  } = useAllV3Routes(amountIn?.currency, currencyOut);

  const { routes: uniRoutes, loading: uniRoutesLoading } = useAllV3Routes(
    amountIn?.currency,
    currencyOut,
    true,
  );
  const routes = algebraRoutes.concat(uniRoutes);

  const algebraQuoteExactInInputs = useMemo(() => {
    return algebraRoutes.map((route) => [
      encodeRouteToPath(route, false),
      amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined,
    ]);
  }, [amountIn, algebraRoutes]);

  const uniQuoteExactInInputs = useMemo(() => {
    return uniRoutes.map((route) => [
      encodeRouteToPath(route, false, true),
      amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined,
    ]);
  }, [amountIn, uniRoutes]);

  const routesLoading = algebraRoutesLoading || uniRoutesLoading;

  const algebraQuotesResults = useSingleContractMultipleData(
    quoter,
    'quoteExactInput',
    algebraQuoteExactInInputs,
    {
      gasRequired: chainId
        ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE
        : undefined,
    },
  );

  const uniQuotesResults = useSingleContractMultipleData(
    uniQuoter,
    'quoteExactInput',
    uniQuoteExactInInputs,
    {
      gasRequired: chainId
        ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE
        : undefined,
    },
  );

  const quotesResults = algebraQuotesResults.concat(uniQuotesResults);

  const trade = useMemo(() => {
    if (!amountIn || !currencyOut) {
      return {
        state: V3TradeState.INVALID,
        trade: null,
      };
    }

    if (routesLoading || quotesResults.some(({ loading }) => loading)) {
      return {
        state: V3TradeState.LOADING,
        trade: null,
      };
    }

    const { bestRoute, amountOut } = quotesResults.reduce(
      (
        currentBest: {
          bestRoute: Route<Currency, Currency> | null;
          amountOut: BigNumber | null;
        },
        { result },
        i,
      ) => {
        if (!result) return currentBest;

        if (currentBest.amountOut === null) {
          return {
            bestRoute: routes[i],
            amountOut: result.amountOut,
          };
        } else if (currentBest.amountOut.lt(result.amountOut)) {
          return {
            bestRoute: routes[i],
            amountOut: result.amountOut,
          };
        }

        return currentBest;
      },
      {
        bestRoute: null,
        amountOut: null,
      },
    );

    if (!bestRoute || !amountOut) {
      return {
        state: V3TradeState.NO_ROUTE_FOUND,
        trade: null,
      };
    }

    const isSyncing = quotesResults.some(({ syncing }) => syncing);

    return {
      state: isSyncing ? V3TradeState.SYNCING : V3TradeState.VALID,
      trade: Trade.createUncheckedTrade({
        route: bestRoute,
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: amountIn,
        outputAmount: CurrencyAmount.fromRawAmount(
          currencyOut,
          amountOut.toString(),
        ),
      }),
    };
  }, [amountIn, currencyOut, quotesResults, routes, routesLoading]);

  return useMemo(() => {
    return trade;
  }, [trade]);
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestV3TradeExactOut(
  currencyIn?: Currency,
  amountOut?: CurrencyAmount<Currency>,
): {
  state: V3TradeState;
  trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null;
} {
  const { chainId } = useActiveWeb3React();
  const quoter = useV3Quoter();
  const univ3Quoter = useUniV3Quoter();

  const {
    routes: algebraRoutes,
    loading: algebraRoutesLoading,
  } = useAllV3Routes(currencyIn, amountOut?.currency);

  const { routes: uniRoutes, loading: uniRoutesLoading } = useAllV3Routes(
    currencyIn,
    amountOut?.currency,
    true,
  );

  const routesLoading = algebraRoutesLoading || uniRoutesLoading;
  const routes = algebraRoutes.concat(uniRoutes);

  const algebraQuoteExactOutInputs = useMemo(() => {
    return algebraRoutes.map((route) => [
      encodeRouteToPath(route, true),
      amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined,
    ]);
  }, [amountOut, algebraRoutes]);

  const uniQuoteExactOutInputs = useMemo(() => {
    return uniRoutes.map((route) => [
      encodeRouteToPath(route, true, true),
      amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined,
    ]);
  }, [amountOut, uniRoutes]);

  const algebraQuotesResults = useSingleContractMultipleData(
    quoter,
    'quoteExactOutput',
    algebraQuoteExactOutInputs,
    {
      gasRequired: chainId
        ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE
        : undefined,
    },
  );

  const uniQuotesResults = useSingleContractMultipleData(
    univ3Quoter,
    'quoteExactOutput',
    uniQuoteExactOutInputs,
    {
      gasRequired: chainId
        ? QUOTE_GAS_OVERRIDES[chainId] ?? DEFAULT_GAS_QUOTE
        : undefined,
    },
  );

  const quotesResults = algebraQuotesResults.concat(uniQuotesResults);

  const trade = useMemo(() => {
    if (
      !amountOut ||
      !currencyIn ||
      quotesResults.some(({ valid }) => !valid)
    ) {
      return {
        state: V3TradeState.INVALID,
        trade: null,
      };
    }

    if (routesLoading || quotesResults.some(({ loading }) => loading)) {
      return {
        state: V3TradeState.LOADING,
        trade: null,
      };
    }

    const { bestRoute, amountIn } = quotesResults.reduce(
      (
        currentBest: {
          bestRoute: Route<Currency, Currency> | null;
          amountIn: BigNumber | null;
        },
        { result },
        i,
      ) => {
        if (!result) return currentBest;

        if (currentBest.amountIn === null) {
          return {
            bestRoute: routes[i],
            amountIn: result.amountIn,
          };
        } else if (currentBest.amountIn.gt(result.amountIn)) {
          return {
            bestRoute: routes[i],
            amountIn: result.amountIn,
          };
        }

        return currentBest;
      },
      {
        bestRoute: null,
        amountIn: null,
      },
    );

    if (!bestRoute || !amountIn) {
      return {
        state: V3TradeState.NO_ROUTE_FOUND,
        trade: null,
      };
    }

    const isSyncing = quotesResults.some(({ syncing }) => syncing);

    return {
      state: isSyncing ? V3TradeState.SYNCING : V3TradeState.VALID,
      trade: Trade.createUncheckedTrade({
        route: bestRoute,
        tradeType: TradeType.EXACT_OUTPUT,
        inputAmount: CurrencyAmount.fromRawAmount(
          currencyIn,
          amountIn.toString(),
        ),
        outputAmount: amountOut,
      }),
    };
  }, [amountOut, currencyIn, quotesResults, routes, routesLoading]);

  return useMemo(() => {
    return trade;
  }, [trade]);
}
