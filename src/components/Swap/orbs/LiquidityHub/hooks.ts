import {
  ChainId,
  Currency,
  CurrencyAmount,
  JSBI,
  Token,
  TokenAmount,
} from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useCallback, useMemo } from 'react';
import { tryParseAmount } from 'state/swap/hooks';
import { getConfig } from 'config';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import {
  constructSDK,
  Quote,
  QUOTE_ERRORS,
  zeroAddress,
} from '@orbs-network/liquidity-hub-sdk';
import { OptimalRate, SwapSide } from '@paraswap/sdk';
import { useLiquidityHubManager } from 'state/user/hooks';
import { useIsNativeCurrencyCallback } from '../hooks';
import { getDexMinAmountOut, isLiquidityHubTrade } from '../utils';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useLiquidityHub = () => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId || ChainId.MATIC;

  return useMemo(
    () => constructSDK({ chainId: chainIdToUse, partner: 'quickswap' }),
    [chainIdToUse],
  );
};

export const useParseRawAmount = (currency?: Currency, amount?: string) => {
  const { chainId } = useActiveWeb3React();
  return useMemo(() => {
    if (!currency || !amount) return undefined;
    return currency instanceof Token
      ? new TokenAmount(currency, JSBI.BigInt(amount))
      : CurrencyAmount.ether(JSBI.BigInt(amount), chainId);
  }, [chainId, amount, currency]);
};

export const useIsLiquidityHubTrade = (
  swapSide: SwapSide,
  disabled: boolean,
  allowedSlippage: number,
  quote?: Quote | null,
  optimalRate?: OptimalRate,
  showWrap?: boolean,
  isLiquidityHubOnly?: boolean,
) => {
  const [liquidityHubDisabled] = useLiquidityHubManager();
  const isSupported = useIsLiquidityHubSupported();

  return useMemo(() => {
    if (showWrap) return false;
    if (isLiquidityHubOnly) return true;
    if (localStorage.getItem('force-lh')) return true;

    if (
      swapSide === SwapSide.BUY ||
      liquidityHubDisabled ||
      disabled ||
      !isSupported
    ) {
      return false;
    }

    return isLiquidityHubTrade(allowedSlippage, quote, optimalRate);
  }, [
    allowedSlippage,
    quote,
    optimalRate,
    isSupported,
    swapSide,
    disabled,
    liquidityHubDisabled,
    isLiquidityHubOnly,
    showWrap,
  ]);
};

export const useIsLiquidityHubSupported = () => {
  const { chainId } = useActiveWeb3React();
  const config = getConfig(chainId);
  return !!config['swap']['liquidityHub'];
};

const isLowSrcAmountError = (error: any) => {
  return (error as Error)?.message === QUOTE_ERRORS.ldv;
};

export const useLiquidityHubQuote = (
  allowedSlippage?: number,
  typedAmount?: string,
  inCurrency?: Currency,
  outCurrency?: Currency,
  dexOutAmount?: string,
  disabled?: boolean,
) => {
  const { account, chainId } = useActiveWeb3React();
  const inputCurrencyAmount = tryParseAmount(chainId, typedAmount, inCurrency);
  const inAmount = inputCurrencyAmount?.raw.toString();
  const isNativeCurrency = useIsNativeCurrencyCallback();

  const fromToken = wrappedCurrency(inCurrency, chainId)?.address;
  const toToken = useMemo(() => {
    if (!outCurrency) return;
    return isNativeCurrency(outCurrency)
      ? zeroAddress
      : wrappedCurrency(outCurrency, chainId)?.address;
  }, [outCurrency, isNativeCurrency, chainId]);
  const queryClient = useQueryClient();
  const isSupported = useIsLiquidityHubSupported();
  const liquidityHub = useLiquidityHub();

  const dexMinAmountOut = useMemo(() => {
    return getDexMinAmountOut(allowedSlippage || 0, dexOutAmount);
  }, [dexOutAmount, allowedSlippage]);

  const { wrapType } = useWrapCallback(inCurrency, outCurrency, typedAmount);

  const queryKey = [
    'liquidity-hub-quote',
    fromToken,
    toToken,
    inAmount,
    allowedSlippage,
    chainId,
  ];

  const fecthQuoteCallback = useCallback(
    (signal?: AbortSignal) => {
      return liquidityHub.getQuote({
        fromToken: fromToken!,
        toToken: toToken!,
        inAmount: inAmount!,
        dexMinAmountOut,
        account,
        slippage: allowedSlippage! / 100,
        signal,
      });
    },
    [
      liquidityHub,
      fromToken,
      toToken,
      inAmount,
      dexMinAmountOut,
      account,
      allowedSlippage,
      queryKey,
    ],
  );

  const query = useQuery<Quote | null>({
    queryKey,
    queryFn: async ({ signal }) => {
      return fecthQuoteCallback(signal);
    },
    retry(failureCount, error) {
      if (isLowSrcAmountError(error)) return false;
      if (failureCount > 3) return false;
      return true;
    },
    refetchInterval: (data, query) => {
      if (isLowSrcAmountError(query.state.fetchFailureReason)) return 0;
      return 10_000;
    },
    staleTime: Infinity,
    enabled:
      !!account &&
      !!inAmount &&
      !!fromToken &&
      !!toToken &&
      wrapType !== WrapType.WRAP &&
      wrapType !== WrapType.UNWRAP &&
      !disabled &&
      allowedSlippage !== undefined &&
      isSupported,
  });

  return useMemo(() => {
    return {
      ...query,
      ensureQueryData: () =>
        queryClient.ensureQueryData({
          queryKey,
          queryFn: ({ signal }) => fecthQuoteCallback(signal),
        }),
    };
  }, [query, queryClient, fecthQuoteCallback, queryKey]);
};
