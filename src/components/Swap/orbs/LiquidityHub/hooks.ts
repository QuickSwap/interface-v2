import { ChainId, Currency } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useCallback, useMemo } from 'react';
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
import { getAmountMinusSlippage } from '../utils';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { WrapType } from 'hooks/useWrapCallback';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import BN from 'bignumber.js';

export const useIsLhPureAggregationMode = () => {
  const { chainId } = useActiveWeb3React();
  return useMemo(() => [ChainId.ETHEREUM].includes(chainId), [chainId]);
};

export const useLiquidityHubSDK = () => {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId || ChainId.MATIC;

  return useMemo(
    () => constructSDK({ chainId: chainIdToUse, partner: 'quickswap' }),
    [chainIdToUse],
  );
};

export const useIsLiquidityHubTrade = (
  swapSide: SwapSide,
  disabled: boolean,
  allowedSlippage: number,
  quote?: Quote | null,
  optimalRate?: OptimalRate,
  showWrap?: boolean,
  isLiquidityHubOnly?: boolean,
  liquidityHubQuoteLoading?: boolean,
) => {
  const [liquidityHubDisabled] = useLiquidityHubManager();
  const isSupported = useIsLiquidityHubSupported();

  return useMemo(() => {
    if (showWrap) return false;
    if (isLiquidityHubOnly) return true;
    if (liquidityHubQuoteLoading) return false;

    if (
      swapSide === SwapSide.BUY ||
      liquidityHubDisabled ||
      disabled ||
      !isSupported
    ) {
      return false;
    }

    const dexMinAmountOut = getAmountMinusSlippage(
      allowedSlippage,
      optimalRate?.destAmount,
    );
    return BN(quote?.outAmount || 0).gt(dexMinAmountOut || 0);
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
    liquidityHubQuoteLoading,
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

export const useLiquidityHubQuote = ({
  allowedSlippage,
  inAmount,
  inCurrency,
  outCurrency,
  dexOutAmount,
  disabled: _disabled,
  wrapType,
  swappingLiquidityHub,
}: {
  allowedSlippage?: number;
  inAmount?: string;
  inCurrency?: Currency;
  outCurrency?: Currency;
  dexOutAmount?: string;
  disabled?: boolean;
  wrapType?: WrapType;
  swappingLiquidityHub: boolean;
}) => {
  const { account, chainId } = useActiveWeb3React();
  const isNativeCurrency = useIsNativeCurrencyCallback();
  const isLhPureAggregationMode = useIsLhPureAggregationMode();

  const fromToken = wrappedCurrency(inCurrency, chainId)?.address;
  const toToken = useMemo(() => {
    if (!outCurrency) return;
    return isNativeCurrency(outCurrency)
      ? zeroAddress
      : wrappedCurrency(outCurrency, chainId)?.address;
  }, [outCurrency, isNativeCurrency, chainId]);
  const queryClient = useQueryClient();
  const isSupported = useIsLiquidityHubSupported();
  const liquidityHub = useLiquidityHubSDK();

  const dexMinAmountOut = useMemo(() => {
    // since in pure aggregation mode we use paraswap only as a fallback we don't need the dexMinAmountOut
    if (isLhPureAggregationMode) return;
    return getAmountMinusSlippage(allowedSlippage || 0, dexOutAmount);
  }, [dexOutAmount, allowedSlippage, isLhPureAggregationMode]);

  const disabled = isLhPureAggregationMode ? false : _disabled;

  const queryKey = useMemo(() => {
    return [
      'liquidity-hub-quote',
      fromToken,
      toToken,
      inAmount,
      allowedSlippage,
      chainId,
      dexMinAmountOut,
    ];
  }, [fromToken, toToken, inAmount, allowedSlippage, chainId, dexMinAmountOut]);

  const fecthQuoteCallback = useCallback(
    (signal?: AbortSignal) => {
      if (!fromToken || !toToken || !inAmount || !allowedSlippage) {
        throw new Error('Invalid input');
      }
      return liquidityHub.getQuote({
        fromToken,
        toToken,
        inAmount,
        dexMinAmountOut,
        account,
        slippage: allowedSlippage / 100,
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
    keepPreviousData: inAmount ? true : false,
    enabled:
      !!account &&
      !!inAmount &&
      !!fromToken &&
      !!chainId &&
      !!toToken &&
      wrapType !== WrapType.WRAP &&
      wrapType !== WrapType.UNWRAP &&
      !disabled &&
      allowedSlippage !== undefined &&
      !swappingLiquidityHub &&
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
