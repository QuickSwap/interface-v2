import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'state';
import { useCallback } from 'react';
import { selectVault, typeInput } from './actions';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { CHAIN_INFO } from 'constants/v3/chains';
import { useActiveWeb3React } from 'hooks';
import { useCurrency } from 'hooks/v3/Tokens';
import { ICHIVault } from 'hooks/useICHIData';

export function useSingleTokenState(): AppState['singleToken'] {
  return useSelector<AppState, AppState['singleToken']>(
    (state) => state.singleToken,
  );
}

export function useSingleTokenTypeInput() {
  const typedValue = useSelector<
    AppState,
    AppState['singleToken']['typedValue']
  >((state) => state.singleToken.typedValue);

  const dispatch = useDispatch();
  const _typeInput = useCallback(
    (val: string) => {
      dispatch(typeInput({ typedValue: val }));
    },
    [dispatch],
  );

  return { typeInput: _typeInput, typedValue };
}

export function useSingleTokenVault() {
  const selectedVault = useSelector<
    AppState,
    AppState['singleToken']['selectedVault']
  >((state) => state.singleToken.selectedVault);

  const dispatch = useDispatch();
  const _selectVault = useCallback(
    (vault: ICHIVault | undefined) => {
      dispatch(selectVault({ vault }));
    },
    [dispatch],
  );

  return { selectVault: _selectVault, selectedVault };
}

export function useSingleTokenCurrency() {
  const parsedQuery = useParsedQueryString();
  const { chainId } = useActiveWeb3React();
  const chainInfo = CHAIN_INFO[chainId];
  const currencyId =
    parsedQuery && parsedQuery.currency
      ? (parsedQuery.currency as string).toLowerCase() === 'eth' ||
        (parsedQuery.currency as string).toLowerCase() === 'matic'
        ? chainInfo.nativeCurrencySymbol.toLowerCase()
        : (parsedQuery.currency as string)
      : undefined;
  const currency = useCurrency(currencyId);
  return currency ?? undefined;
}
