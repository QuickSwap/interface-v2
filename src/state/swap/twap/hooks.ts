import { ChainId, Currency, ETHER, Token } from '@uniswap/sdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { AppDispatch, AppState } from 'state';
import { TimeDuration } from '@orbs-network/twap-sdk';
import {
  Field,
  invertTradePrice,
  replaceSwapState,
  resetTradePrice,
  selectCurrency,
  setChunks,
  setDuration,
  setFillDelay,
  setIsMarketOrder,
  setSwapDelay,
  setTradePrice,
  setUpdatingOrders,
  SwapDelay,
  switchCurrencies,
  toggleMarketOrder,
  typeInput,
} from './actions';
import { queryParametersToSwapState } from '../hooks';

export function useTwapState(): AppState['twap'] {
  return useSelector<AppState, AppState['twap']>((state) => state.twap);
}

export function useTwapSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void;
  onSwitchTokens: () => void;
  onUserInput: (field: Field, typedValue: string) => void;
  onChunksInput: (typedValue: number) => void;
  onDurationInput: (typedValue?: TimeDuration) => void;
  onFillDelayInput: (typedValue: TimeDuration) => void;
  onSetSwapDelay: (swapDelay: SwapDelay) => void;
  onTradePriceInput: (typedValue?: string) => void;
  onMarketOrder: (isMarketOrder: boolean) => void;
  onInvertLimitPrice: (isTradePriceInverted: boolean) => void;
  onUpdatingOrders: (updatingOrders: boolean) => void;
  onToggleMarketOrder: () => void;
  onResetTradePrice: () => void;
} {
  const dispatch = useDispatch<AppDispatch>();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
  const timer = useRef<any>(null);

  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId:
            currency instanceof Token
              ? currency.address
              : currency === nativeCurrency
              ? 'ETH'
              : '',
        }),
      );
    },
    [dispatch, nativeCurrency],
  );

  const onSetSwapDelay = useCallback(
    (swapDelay: SwapDelay) => {
      dispatch(setSwapDelay({ swapDelay }));
    },
    [dispatch],
  );

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies());
  }, [dispatch]);

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }));
      if (!typedValue) {
        onSetSwapDelay(SwapDelay.INIT);
        return;
      }
      onSetSwapDelay(SwapDelay.USER_INPUT);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onSetSwapDelay(SwapDelay.USER_INPUT_COMPLETE);
      }, 300);
    },
    [dispatch, onSetSwapDelay],
  );

  const onChunksInput = useCallback(
    (chunks: number) => {
      dispatch(setChunks({ chunks }));
    },
    [dispatch],
  );

  const onFillDelayInput = useCallback(
    (fillDelay: TimeDuration) => {
      dispatch(setFillDelay({ fillDelay }));
    },
    [dispatch],
  );

  const onDurationInput = useCallback(
    (duration?: TimeDuration) => {
      dispatch(setDuration({ duration }));
    },
    [dispatch],
  );

  const onTradePriceInput = useCallback(
    (tradePrice?: string) => {
      dispatch(setTradePrice({ tradePrice }));
    },
    [dispatch],
  );

  const onMarketOrder = useCallback(
    (isMarketOrder: boolean) => {
      dispatch(setIsMarketOrder({ isMarketOrder }));
    },
    [dispatch],
  );

  const onToggleMarketOrder = useCallback(() => {
    dispatch(toggleMarketOrder());
  }, [dispatch]);

  const onInvertLimitPrice = useCallback(
    (isTradePriceInverted: boolean) => {
      dispatch(invertTradePrice({ isTradePriceInverted }));
    },
    [dispatch],
  );

  const onUpdatingOrders = useCallback(
    (updatingOrders: boolean) => {
      dispatch(setUpdatingOrders({ updatingOrders }));
    },
    [dispatch],
  );

  const onResetTradePrice = useCallback(() => {
    dispatch(resetTradePrice());
  }, [dispatch]);

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onSetSwapDelay,
    onChunksInput,
    onFillDelayInput,
    onDurationInput,
    onTradePriceInput,
    onMarketOrder,
    onInvertLimitPrice,
    onUpdatingOrders,
    onToggleMarketOrder,
    onResetTradePrice,
  };
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | {
      inputCurrencyId: string | undefined;
      outputCurrencyId: string | undefined;
    }
  | undefined {
  const { chainId } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const parsedQs = useParsedQueryString();
  const [result, setResult] = useState<
    | {
        inputCurrencyId: string | undefined;
        outputCurrencyId: string | undefined;
      }
    | undefined
  >();

  useEffect(() => {
    if (!chainId) return;
    const parsed = queryParametersToSwapState(parsedQs);

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        swapDelay: SwapDelay.INIT,
      }),
    );

    setResult({
      inputCurrencyId: parsed[Field.INPUT].currencyId,
      outputCurrencyId: parsed[Field.OUTPUT].currencyId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId]);

  return result;
}
