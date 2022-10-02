import { GlobalValue } from 'constants/index';
import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHER,
  JSBI,
  TokenAmount,
  Token,
} from '@uniswap/sdk';
import { useMemo } from 'react';
import ERC20_INTERFACE from 'constants/abis/erc20';
import { useAllTokens } from 'hooks/Tokens';
import { useActiveWeb3React } from 'hooks';
import { useMulticallContract } from 'hooks/useContract';
import { isAddress } from 'utils';
import {
  useSingleContractMultipleData,
  useMultipleContractSingleData,
} from 'state/multicall/hooks';

/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
  uncheckedAddresses?: (string | undefined)[],
): {
  [address: string]: CurrencyAmount | undefined;
} {
  const multicallContract = useMulticallContract();

  const addresses: string[] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
        : [],
    [uncheckedAddresses],
  );

  const results = useSingleContractMultipleData(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address]),
  );

  return useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount }>(
        (memo, address, i) => {
          const value = results?.[i]?.result?.[0];
          if (value)
            memo[address] = CurrencyAmount.ether(JSBI.BigInt(value.toString()));
          return memo;
        },
        {},
      ),
    [addresses, results],
  );
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (
    | {
        chainId: ChainId;
        address: string;
        decimals: number;
        symbol?: string;
        name?: string;
      }
    | undefined
  )[],
): [{ [tokenAddress: string]: TokenAmount | undefined }, boolean] {
  const validatedTokens: any[] = useMemo(
    () =>
      tokens?.filter(
        (t?: {
          chainId: ChainId;
          address: string;
          decimals: number;
          symbol?: string;
          name?: string;
        }): any => isAddress(t?.address) !== false,
      ) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens],
  );

  const balances = useMultipleContractSingleData(
    validatedTokenAddresses,
    ERC20_INTERFACE,
    'balanceOf',
    [address],
  );

  const anyLoading: boolean = useMemo(
    () => balances.some((callState) => callState.loading),
    [balances],
  );

  return [
    useMemo(
      () =>
        address && validatedTokens.length > 0
          ? validatedTokens.reduce<{
              [tokenAddress: string]: TokenAmount | undefined;
            }>((memo, token, i) => {
              const value = balances?.[i]?.result?.[0];
              const amount = value ? JSBI.BigInt(value.toString()) : undefined;
              if (amount) {
                memo[token.address] = new TokenAmount(token, amount);
              }
              return memo;
            }, {})
          : {},
      [address, validatedTokens, balances],
    ),
    anyLoading,
  ];
}

export function useTokenBalances(
  address?: string,
  tokens?: (
    | {
        chainId: ChainId;
        address: string;
        decimals: number;
        symbol?: string;
        name?: string;
      }
    | undefined
  )[],
): { [tokenAddress: string]: TokenAmount | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0];
}

// get the balance for a single token/account combo
export function useTokenBalance(
  account?: string,
  token?: {
    chainId: ChainId;
    address: string;
    decimals: number;
    symbol?: string;
    name?: string;
  },
): TokenAmount | undefined {
  const tokenBalances = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount | undefined)[] {
  const tokens = useMemo(
    () =>
      currencies
        ?.filter((currency) => currency !== ETHER)
        .map((currency) => currency as Token) ?? [],
    [currencies],
  );

  const tokenBalances = useTokenBalances(account, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => currency === ETHER) ?? false,
    [currencies],
  );
  const ethBalance = useETHBalances(containsETH ? [account] : []);

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined;
        if (currency === ETHER) return ethBalance[account];
        if (currency) {
          const address = (currency as Token).address;
          if (!address) {
            return undefined;
          }
          return tokenBalances[address];
        }
        return undefined;
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances],
  );
}

export function useCurrencyBalance(
  account?: string,
  currency?: Currency,
): CurrencyAmount | undefined {
  return useCurrencyBalances(account, [currency])[0];
}

// mimics useAllBalances
export function useAllTokenBalances(): {
  [tokenAddress: string]: TokenAmount | undefined;
} {
  const { account } = useActiveWeb3React();
  const allTokens = useAllTokens();
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [
    allTokens,
  ]);
  const balances = useTokenBalances(account ?? undefined, allTokensArray);
  return balances ?? {};
}
