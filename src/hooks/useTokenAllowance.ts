import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { useTokenContract } from './useContract';
import { useLastTransactionHash } from 'state/transactions/hooks';
import { useQuery } from '@tanstack/react-query';

export function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string,
): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false);
  const lastTx = useLastTransactionHash();

  const { data: allowance } = useQuery({
    queryKey: ['token-allowance', token?.address, owner, spender, lastTx],
    queryFn: async () => {
      if (!contract || !spender || !owner) return null;
      const res = await contract.allowance(owner, spender);
      return res;
    },
  });

  return useMemo(
    () =>
      token && allowance
        ? CurrencyAmount.fromRawAmount(token, allowance.toString())
        : undefined,
    [token, allowance],
  );
}
