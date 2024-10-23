import { Token } from '@uniswap/sdk';
import { CurrencyAmount, Token as V3Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useTokenContract } from './useContract';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { useQuery } from '@tanstack/react-query';
import { TokenAmount } from '@uniswap/sdk';

function useTokenAllowanceData(
  tokenAddress?: string,
  owner?: string,
  spender?: string,
) {
  const contract = useTokenContract(tokenAddress, false);
  const lastTx = useLastTransactionHash();

  return useQuery({
    queryKey: ['token-allowance', tokenAddress, owner, spender, lastTx],
    queryFn: async () => {
      if (!contract || !spender || !owner) return null;
      const res = await contract.allowance(owner, spender);
      return res;
    },
  });
}

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string,
): TokenAmount | undefined {
  const { data: allowance } = useTokenAllowanceData(
    token?.address,
    owner,
    spender,
  );

  return useMemo(
    () =>
      token && allowance
        ? new TokenAmount(token, allowance.toString())
        : undefined,
    [token, allowance],
  );
}

export function useV3TokenAllowance(
  token?: V3Token,
  owner?: string,
  spender?: string,
): CurrencyAmount<V3Token> | undefined {
  const { data: allowance } = useTokenAllowanceData(
    token?.address,
    owner,
    spender,
  );

  return useMemo(
    () =>
      token && allowance
        ? CurrencyAmount.fromRawAmount(token, allowance.toString())
        : undefined,
    [token, allowance],
  );
}
