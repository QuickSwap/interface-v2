import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useSingleCallResult } from '../state/multicall/hooks';
import { useTokenContract } from './useContract';
import usePrevious from './usePrevious';

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string,
): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result;

  const prevAllowance = usePrevious(allowance);

  const _allowance = useMemo(() => {
    if (!prevAllowance) return allowance;

    if (!allowance && prevAllowance) return prevAllowance;

    return allowance;
  }, [allowance, prevAllowance]);

  return useMemo(
    () =>
      token && _allowance
        ? CurrencyAmount.fromRawAmount(token, _allowance.toString())
        : undefined,
    [token, _allowance],
  );
}
