import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MIN_FILL_DELAY_MINUTES,
  MAX_FILL_DELAY_DAYS,
  MIN_DURATION_MINUTES,
  groupOrdersByStatus,
  zeroAddress,
  Order,
  OrderType,
  TwapAbi,
  OrderStatus,
} from '@orbs-network/twap-sdk';
import { ChainId, Currency, currencyEquals, ETHER } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useCallback, useMemo } from 'react';
import { useTwapContext } from './TwapContext';
import { V3Currency } from 'v3lib/entities/v3Currency';
import { useApproval } from '../hooks';
import { useCurrency } from 'hooks/Tokens';
import { useTranslation } from 'react-i18next';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { Field } from '../../../../state/swap/actions';
import useUSDCPrice from 'utils/useUSDCPrice';
import { useTwapState } from 'state/swap/twap/hooks';
import { SwapSide } from '@paraswap/sdk';
import { paraswapTaxBuy, paraswapTaxSell } from 'constants/index';
import { getBestTradeCurrencyAddress, useParaswap } from 'hooks/useParaswap';
import { tryParseAmount } from 'state/swap/hooks';
import { useContract } from 'hooks/useContract';
import { calculateGasMargin } from 'utils';

export const useInputError = () => {
  const { account } = useActiveWeb3React();
  const { currencyBalances, parsedAmount, currencies } = useTwapContext();
  const parsedQuery = useParsedQueryString();
  const swapType = parsedQuery?.swapIndex;
  const durationWarning = useDurationWarning();
  const tradeSizeWarning = useTradeSizeWarning();
  const fillDelayWarning = useFillDelayWarning();

  return useMemo(() => {
    if (!account) {
      return 'Connect Wallet';
    }
    if (!parsedAmount) {
      return 'Enter an amount';
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      return 'Select a token';
    }

    const amountIn = parsedAmount;

    if (
      swapType !== '0' &&
      currencyBalances[Field.INPUT] &&
      amountIn &&
      currencyBalances[Field.INPUT].lessThan(amountIn)
    ) {
      return 'Insufficient ' + amountIn.currency.symbol + ' balance';
    }
    if (durationWarning) {
      return durationWarning;
    }
    if (tradeSizeWarning) {
      return tradeSizeWarning;
    }
    if (fillDelayWarning) {
      return fillDelayWarning;
    }
  }, [
    currencyBalances,
    account,
    parsedAmount,
    currencies,
    swapType,
    currencyBalances[Field.INPUT],
    durationWarning,
    tradeSizeWarning,
    fillDelayWarning,
  ]);
};

export const useDurationWarning = () => {
  const { t } = useTranslation();
  const { warnings } = useDerivedTwapSwapData();
  return useMemo(() => {
    if (warnings.minDuration) {
      return t('minExpiryWarning', { value: MIN_DURATION_MINUTES });
    }
    if (warnings.maxDuration) {
      return t('maxExpiryWarning');
    }
  }, [warnings.maxDuration, warnings.minDuration, t]);
};

export const useTradeSizeWarning = () => {
  const { t } = useTranslation();

  const { twapSDK } = useTwapContext();
  const { warnings } = useDerivedTwapSwapData();

  return useMemo(() => {
    if (warnings.tradeSize) {
      return t('tradeSizeWarning', { usd: twapSDK.config.minChunkSizeUsd });
    }
  }, [warnings.tradeSize, t, twapSDK.config.minChunkSizeUsd]);
};

export const useFillDelayWarning = () => {
  const { t } = useTranslation();
  const { warnings } = useDerivedTwapSwapData();

  return useMemo(() => {
    if (warnings.minFillDelay) {
      return t('minFillDelayWarning', { value: MIN_FILL_DELAY_MINUTES });
    }
    if (warnings.maxFillDelay) {
      return t('maxFillDelayWarning', { value: MAX_FILL_DELAY_DAYS });
    }
  }, [warnings.minFillDelay, warnings.maxFillDelay, t]);
};

export const isNativeCurrency = (currency?: Currency, chainId?: ChainId) => {
  if (!currency || !chainId) return false;
  const nativeCurrency = ETHER[chainId];
  return (
    currencyEquals(currency, nativeCurrency) ||
    (currency as V3Currency).isNative
  );
};

export const useOrderTitle = (order?: Order) => {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!order) return '';
    switch (order.orderType) {
      case OrderType.LIMIT:
        return t('limitOrder');
      case OrderType.TWAP_MARKET:
        return t('twapMarketOrder');
      case OrderType.TWAP_LIMIT:
        return t('twapLimitOrder');

      default:
        return t('twap');
    }
  }, [order, t]);
};

export const useTwapApprovalCallback = () => {
  const { parsedAmount, currencies, twapSDK } = useTwapContext();

  return useApproval(
    twapSDK.config.twapAddress,
    currencies[Field.INPUT],
    parsedAmount?.raw.toString(),
  );
};

export const useTwapOrdersQuery = () => {
  const { account } = useActiveWeb3React();
  const { twapSDK } = useTwapContext();
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => ['useTwapOrders', account, twapSDK.config.chainId],
    [account, twapSDK.config.chainId],
  );
  const query = useQuery(
    queryKey,
    async ({ signal }) => {
      return twapSDK.getOrders(account!, signal);
    },
    {
      enabled: !!account,
    },
  );
  const fetchUpdatedOrders = useCallback(
    async (id?: number) => {
      if (!id) {
        query.refetch();
      } else {
        try {
          const orders = await twapSDK.waitForOrdersUpdate(id, account!);
          if (orders) {
            queryClient.setQueryData(queryKey, orders);
            return orders;
          }
        } catch (error) {
          console.error(error);
          return query.data;
        }
      }
    },
    [account, query, queryClient, queryKey, twapSDK],
  );

  return useMemo(() => {
    return {
      ...query,
      queryKey,
      fetchUpdatedOrders,
    };
  }, [query, fetchUpdatedOrders, queryKey]);
};

export const useGrouppedTwapOrders = () => {
  const orders = useTwapOrdersQuery();

  return useMemo(() => {
    if (!orders.data) return;
    return groupOrdersByStatus(orders.data);
  }, [orders.data]);
};

export const useTwapOrderCurrency = (address?: string) => {
  const _address = address?.toLowerCase() === zeroAddress ? 'ETH' : address;
  const currency = useCurrency(_address);
  return currency || undefined;
};

export const useFillDelayAsText = (fillDelay?: number) => {
  const { t } = useTranslation();
  return useMemo(() => {
    if (!fillDelay) return;

    const days = Math.floor(fillDelay / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (fillDelay % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((fillDelay % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((fillDelay % (1000 * 60)) / 1000);

    const arr: string[] = [];

    if (days) {
      arr.push(`${days} ${t('days')} `);
    }
    if (hours) {
      arr.push(`${hours} ${t('hours')} `);
    }
    if (minutes) {
      arr.push(`${minutes} ${t('minutes')}`);
    }
    if (seconds) {
      arr.push(`${seconds} ${t('seconds')}`);
    }

    return arr.join(' ');
  }, [fillDelay, t]);
};

export const useOptimalRate = () => {
  const paraswap = useParaswap();
  const { currencies, maxImpactAllowed } = useTwapContext();
  const { chainId, account } = useActiveWeb3React();
  const chainIdToUse = chainId || ChainId.MATIC;
  const inputCurrency = currencies[Field.INPUT];
  const outputCurrency = currencies[Field.OUTPUT];

  // we always use 1 as the amount for the market price
  const srcAmount = tryParseAmount(
    chainIdToUse,
    '1',
    inputCurrency,
  )?.raw.toString();

  const srcToken = inputCurrency
    ? getBestTradeCurrencyAddress(inputCurrency, chainIdToUse)
    : undefined;
  const destToken = outputCurrency
    ? getBestTradeCurrencyAddress(outputCurrency, chainIdToUse)
    : undefined;

  return useQuery({
    queryKey: [
      'fetchTwapOptimalRate',
      srcToken,
      destToken,
      srcAmount,
      account,
      chainId,
      maxImpactAllowed,
    ],
    queryFn: async () => {
      if (!srcToken || !destToken || !srcAmount || !account)
        return { error: undefined, rate: undefined };
      try {
        const rate = await paraswap.getRate({
          srcToken,
          destToken,
          srcDecimals: inputCurrency?.decimals,
          destDecimals: outputCurrency?.decimals,
          amount: srcAmount,
          side: SwapSide.SELL,
          options: {
            includeDEXS: 'quickswap,quickswapv3,quickswapv3.1,quickperps',
            maxImpact: maxImpactAllowed,
            partner: 'quickswapv3',
            //@ts-ignore
            srcTokenTransferFee: paraswapTaxSell[srcToken.toLowerCase()],
            destTokenTransferFee: paraswapTaxBuy[destToken.toLowerCase()],
          },
        });

        return { error: undefined, rate };
      } catch (err) {
        return { error: err.message, rate: undefined };
      }
    },
    refetchInterval: 5000,
    enabled: !!srcToken && !!destToken && !!account,
  });
};

export const useTradePrice = () => {
  const { isMarketOrder, currencies } = useTwapContext();
  const state = useTwapState();
  const { chainId } = useActiveWeb3React();
  const { data } = useOptimalRate();
  const marketPrice = data?.rate?.destAmount;

  return useMemo(() => {
    if (isMarketOrder) return marketPrice;
    let result = marketPrice;
    if (state.tradePrice !== undefined) {
      result = tryParseAmount(
        chainId,
        state.isTradePriceInverted
          ? (1 / Number(state.tradePrice)).toString()
          : state.tradePrice,
        currencies[Field.OUTPUT],
      )?.raw.toString();
    }
    return result;
  }, [
    state.tradePrice,
    chainId,
    marketPrice,
    state.isTradePriceInverted,
    isMarketOrder,
    currencies,
  ]);
};

export const useDerivedTwapSwapData = () => {
  const {
    isMarketOrder,
    isLimitPanel,
    parsedAmount,
    currencies,
    twapSDK,
    currentTime,
  } = useTwapContext();
  const price = useTradePrice();
  const state = useTwapState();
  const oneSrcTokenUsd = Number(
    useUSDCPrice(currencies[Field.INPUT])?.toSignificant() ?? 0,
  );

  const values = twapSDK.derivedSwapValues({
    srcAmount: parsedAmount?.raw.toString(),
    price,
    customDuration: state.duration,
    customChunks: state.chunks,
    customFillDelay: state.fillDelay,
    isLimitPanel,
    oneSrcTokenUsd,
    srcDecimals: currencies[Field.INPUT]?.decimals,
    destDecimals: currencies[Field.OUTPUT]?.decimals,
    isMarketOrder,
  });
  const deadline = useMemo(() => {
    return twapSDK.orderDeadline(currentTime, values.duration);
  }, [currentTime, values.duration, twapSDK]);

  return useMemo(() => {
    return {
      ...values,
      deadline,
    };
  }, [values, deadline]);
};

export const useInputTitle = () => {
  const { isLimitPanel } = useTwapContext();
  const { t } = useTranslation();
  return {
    inInputTitle: isLimitPanel ? t('sell') : `${t('allocate')}`,
    outInputTitle: isLimitPanel ? t('buy') : `${t('toBuy')}`,
  };
};

const useUpdateCancelledOrderCallback = () => {
  const { queryKey, data: orders } = useTwapOrdersQuery();
  const queryClient = useQueryClient();
  return useCallback(
    (orderId: number) => {
      const updatedOrders = orders?.map((order) => {
        if (order.id === orderId) {
          return { ...order, status: OrderStatus.Canceled };
        }
        return order;
      });
      queryClient.setQueryData(queryKey, updatedOrders);
    },
    [orders, queryClient, queryKey],
  );
};

export const useCancelOrder = (onSuccess?: () => void) => {
  const { twapSDK } = useTwapContext();
  const onOrderCancelled = useUpdateCancelledOrderCallback();
  const tokenContract = useContract(twapSDK.config.twapAddress, TwapAbi);

  return useMutation({
    mutationFn: async (orderId: number) => {
      if (!tokenContract) {
        throw new Error('Missing tokenContract');
      }
      twapSDK.analytics.onCancelOrderRequest(orderId);
      const gasEstimate = await tokenContract.estimateGas.cancel(orderId);
      const txResponse = await tokenContract.functions.cancel(orderId, {
        gasLimit: calculateGasMargin(gasEstimate),
      });

      const txReceipt = await txResponse.wait();
      twapSDK.analytics.onCancelOrderSuccess();
      onOrderCancelled(orderId);
      onSuccess?.();
      return txReceipt;
    },
    onError: (error) => {
      twapSDK.analytics.onCancelOrderError(error);
      throw error;
    },
  });
};
