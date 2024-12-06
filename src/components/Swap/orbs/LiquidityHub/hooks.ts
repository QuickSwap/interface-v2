import { ChainId, Currency } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useCallback, useMemo, useState } from 'react';
import { getConfig } from 'config';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import {
  constructSDK,
  Quote,
  QUOTE_ERRORS,
  zeroAddress,
} from '@orbs-network/liquidity-hub-sdk';
import { useIsNativeCurrencyCallback } from '../hooks';
import { promiseWithTimeout, subtractSlippage } from '../utils';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  disabled,
}: {
  allowedSlippage?: number;
  inAmount?: string;
  inCurrency?: Currency;
  outCurrency?: Currency;
  dexOutAmount?: string;
  disabled?: boolean;
}) => {
  const { account, chainId } = useActiveWeb3React();
  const isNativeCurrency = useIsNativeCurrencyCallback();
  const isSupported = useIsLiquidityHubSupported();
  const fromToken = wrappedCurrency(inCurrency, chainId)?.address;
  const liquidityHub = useLiquidityHubSDK();
  const isLhPureAggregationMode = useIsLhPureAggregationMode();

  const toToken = useMemo(() => {
    if (!outCurrency) return;
    return isNativeCurrency(outCurrency)
      ? zeroAddress
      : wrappedCurrency(outCurrency, chainId)?.address;
  }, [outCurrency, isNativeCurrency, chainId]);

  const queryKey = useMemo(
    () => [
      'useLiquidityHubQuote',
      fromToken,
      toToken,
      inAmount,
      allowedSlippage,
      chainId,
    ],
    [fromToken, toToken, inAmount, allowedSlippage, chainId],
  );

  const query = useQuery<Quote>({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!fromToken || !toToken || !inAmount || !chainId || !allowedSlippage) {
        throw new Error('useLiquidityHubQuote Missing required parameters');
      }
      return liquidityHub.getQuote({
        fromToken,
        toToken,
        inAmount,
        dexMinAmountOut: isLhPureAggregationMode
          ? undefined
          : subtractSlippage(allowedSlippage || 0, dexOutAmount),
        account,
        slippage: allowedSlippage / 100,
        signal,
      });
    },
    retry(failureCount, error) {
      if (isLowSrcAmountError(error)) return false;
      return failureCount < 3;
    },
    refetchInterval: (_, query) => {
      if (isLowSrcAmountError(query.state.fetchFailureReason)) return 0;
      return 15_000;
    },
    staleTime: Infinity,
    enabled:
      !!account &&
      !!inAmount &&
      !!fromToken &&
      !!chainId &&
      !!toToken &&
      !disabled &&
      isSupported,
  });

  const queryClient = useQueryClient();

  return useMemo(() => {
    return {
      ...query,
      getLatestQuote: () => queryClient.getQueryData<Quote>(queryKey),
      refetch: async () => (await query.refetch()).data,
    };
  }, [query, queryClient, queryKey]);
};

export const useGetBetterPrice = (
  fetchLiquidityHubQuote: () => Promise<Quote | undefined>,
) => {
  const [seekingBetterPrice, setSeekingBestPrice] = useState(false);

  const getBetterPrice = useCallback(
    async ({
      skip,
      allowedSlippage = 0,
      dexOutAmount = '',
    }: {
      skip: boolean;
      allowedSlippage?: number;
      dexOutAmount?: string;
    }) => {
      try {
        if (skip) return false;
        setSeekingBestPrice(true);
        const quote = await promiseWithTimeout(fetchLiquidityHubQuote(), 5_000);
        const dexMinAmountOut =
          subtractSlippage(allowedSlippage, dexOutAmount) || 0;
        return BN(quote?.userMinOutAmountWithGas || 0).gt(dexMinAmountOut);
      } catch (error) {
        console.error('useSeekingBetterPrice', error);
      } finally {
        setTimeout(() => {
          setSeekingBestPrice(false);
        }, 50);
      }
    },
    [fetchLiquidityHubQuote],
  );

  return {
    seekingBetterPrice,
    getBetterPrice,
  };
};
