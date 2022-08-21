import { Token, TokenAmount } from '@uniswap/sdk';
import { Token as TokenV3, CurrencyAmount } from '@uniswap/sdk-core';
import { useMemo } from 'react';

import { useTokenContract } from 'hooks/useContract';
import { useSingleCallResult } from 'state/multicall/v3/hooks';

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string,
): TokenAmount | undefined {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result;

  return useMemo(
    () =>
      token && allowance
        ? new TokenAmount(token, allowance.toString())
        : undefined,
    [token, allowance],
  );
}

export function useTokenAllowanceV3(
  token?: TokenV3,
  owner?: string,
  spender?: string,
): CurrencyAmount<TokenV3> | undefined {
  const contract = useTokenContract(token?.address, false);

  const inputs = useMemo(() => [owner, spender], [owner, spender]);
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result;

  return useMemo(
    () =>
      token && allowance
        ? CurrencyAmount.fromRawAmount(token, allowance.toString())
        : undefined,
    [token, allowance],
  );
}
