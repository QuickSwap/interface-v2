import { Currency, currencyEquals, ETHER, WETH } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback';
import { useCallback, useMemo, useReducer } from 'react';
import { tryParseAmount } from 'state/swap/hooks';
import { getTokenLogoURL } from 'utils/getTokenLogoURL';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { V3Currency } from 'v3lib/entities/v3Currency';

export const useLogo = (currency?: Currency) => {
  const getLogo = useGetLogoCallback();
  return useMemo(() => {
    return !currency ? undefined : getLogo(currency);
  }, [currency]);
};

export const useGetLogoCallback = () => {
  const { chainId } = useActiveWeb3React();
  const isNativeCurrency = useIsNativeCurrencyCallback();
  return useCallback(
    (currency?: Currency | null) => {
      if (!currency) return undefined;
      if (isNativeCurrency(currency)) {
        return '/' + currency?.symbol + '.png';
      }
      const address = wrappedCurrency(currency, chainId)?.address;
      if (!address) return undefined;
      try {
        return getTokenLogoURL(address, []).find((it) => it !== 'error') as any;
      } catch (error) {}
    },
    [chainId],
  );
};

export const useIsNativeCurrencyCallback = () => {
  const { chainId } = useActiveWeb3React();
  return useCallback(
    (currency?: Currency) => {
      if (!chainId || !currency) return false;
      const nativeCurrency = ETHER[chainId];
      return (
        currencyEquals(currency, nativeCurrency) ||
        (currency as V3Currency).isNative
      );
    },
    [chainId],
  );
};

export const useApproval = (
  spender?: string,
  inCurrency?: Currency,
  amount?: string,
) => {
  const { chainId } = useActiveWeb3React();
  const isNative = useIsNativeCurrencyCallback();

  const approvalAmount = useMemo(() => {
    return tryParseAmount(
      chainId,
      amount,
      isNative(inCurrency) ? WETH[chainId] : inCurrency,
    );
  }, [chainId, amount, inCurrency]);

  const [approvalState, approve] = useApproveCallback(approvalAmount, spender);

  return {
    approve,
    approvalState,
    isApproved: approvalState === ApprovalState.APPROVED,
    isPending:
      approvalState === ApprovalState.PENDING ||
      approvalState === ApprovalState.UNKNOWN,
  };
};

type Action<TState> =
  | { type: 'UPDATE_STATE'; payload: Partial<TState> }
  | { type: 'RESET' };

function reducer<TState>(
  state: TState,
  action: Action<TState>,
  initialState: TState,
): TState {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export const useConfirmationStore = <TState extends object>(
  initialState: TState,
) => {
  const [state, dispatch] = useReducer(
    (state: TState, action: Action<TState>) =>
      reducer(state, action, initialState),
    initialState,
  );

  const updateStore = useCallback(
    (payload: Partial<TState>) => {
      dispatch({ type: 'UPDATE_STATE', payload });
    },
    [dispatch],
  );

  const resetStore = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    store: state,
    updateStore,
    resetStore,
  };
};
