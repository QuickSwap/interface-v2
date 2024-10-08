import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MIN_FILL_DELAY_MINUTES,
  MAX_FILL_DELAY_FORMATTED,
  MIN_DURATION_MINUTES,
  groupOrdersByStatus,
  zeroAddress,
} from '@orbs-network/twap-sdk';
import { ChainId, Currency, currencyEquals, ETHER } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { useCallback, useMemo } from 'react';
import { useTwapContext } from './context';
import { V3Currency } from 'v3lib/entities/v3Currency';
import { useApproval } from '../hooks';
import { useCurrency } from 'hooks/Tokens';
import { useTranslation } from 'react-i18next';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { Field } from '../../../../state/swap/actions';

export const useInputError = () => {
  const { account } = useActiveWeb3React();
  const { parsedAmount, currencies, currencyBalances } = useTwapContext();
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
  const {
    derivedSwapValues: { warnings },
  } = useTwapContext();
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
  const {
    derivedSwapValues: { warnings },
  } = useTwapContext();
  return useMemo(() => {
    if (warnings.tradeSize) {
      return t('tradeSizeWarning');
    }
  }, [warnings.tradeSize, t]);
};

export const useFillDelayWarning = () => {
  const { t } = useTranslation();
  const {
    derivedSwapValues: { warnings },
  } = useTwapContext();

  return useMemo(() => {
    if (warnings.minFillDelay) {
      return t('minFillDelayWarning', { value: MIN_FILL_DELAY_MINUTES });
    }
    if (warnings.maxFillDelay) {
      return t('maxFillDelayWarning', { value: MAX_FILL_DELAY_FORMATTED });
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

export const useTwapApprovalCallback = () => {
  const {
    twapSDK: { config },
    parsedAmount,
    currencies
  } = useTwapContext();

  return useApproval(
    config.twapAddress,
    currencies[Field.INPUT],
    parsedAmount?.raw.toString(),
  );
};

export const useTwapOrdersQuery = () => {
  const { account } = useActiveWeb3React();
  const { twapSDK } = useTwapContext();
  const queryClient = useQueryClient();
  const queryKey = ['useTwapOrders', account, twapSDK.config.chainId];
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
    [account, query, queryClient, queryKey, twapSDK, query.refetch],
  );

  return useMemo(() => {
    return {
      ...query,
      fetchUpdatedOrders,
    };
  }, [query, fetchUpdatedOrders]);
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
