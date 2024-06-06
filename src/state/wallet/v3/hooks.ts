import { Currency, CurrencyAmount, Ether, Token } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { useMemo } from 'react';
import { useAllTokens } from 'hooks/Tokens';
import { useMulticall2Contract } from 'hooks/useContract';
import { Interface } from '@ethersproject/abi';
import ERC20ABI from '../../../constants/abis/erc20.json';
import { Erc20Interface } from 'abis/types/Erc20';
import usePrevious, { usePreviousNonEmptyObject } from 'hooks/usePrevious';
import { useActiveWeb3React } from 'hooks';
import { isAddress } from 'utils';
import {
  useMultipleContractSingleData,
  useSingleContractMultipleData,
  getSingleContractMultipleDataImmediately,
  getMultipleContractSingleDataImmediately,
} from 'state/multicall/v3/hooks';

import { Contract } from '@ethersproject/contracts';
import { ChainId } from '@uniswap/sdk';
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useETHBalances(
  uncheckedAddresses?: (string | undefined)[],
): {
  [address: string]: CurrencyAmount<Currency> | undefined;
} {
  const { chainId } = useActiveWeb3React();
  const multicallContract = useMulticall2Contract();

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

  const balances = useMemo(
    () =>
      addresses.reduce<{ [address: string]: CurrencyAmount<Currency> }>(
        (memo, address, i) => {
          const value = results?.[i]?.result?.[0];
          if (value && chainId)
            memo[address] = CurrencyAmount.fromRawAmount(
              Ether.onChain(chainId),
              JSBI.BigInt(value.toString()),
            );
          return memo;
        },
        {},
      ),
    [addresses, chainId, results],
  );

  const prevBalances = usePreviousNonEmptyObject(balances);

  return useMemo(() => {
    if (!prevBalances) return {};

    if (
      Object.keys(balances).length === 0 &&
      Object.keys(prevBalances).length !== 0
    )
      return prevBalances;

    return balances;
  }, [balances, prevBalances]);
}

/**
 * Returns a map of token addresses to their eventually consistent token balances for a single account.
 */
export function useTokenBalancesWithLoadingIndicator(
  address?: string,
  tokens?: (Token | undefined)[],
): [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean] {
  const validatedTokens: Token[] = useMemo(
    () =>
      tokens?.filter(
        (t?: Token): t is Token => isAddress(t?.address) !== false,
      ) ?? [],
    [tokens],
  );

  const validatedTokenAddresses = useMemo(
    () => validatedTokens.map((vt) => vt.address),
    [validatedTokens],
  );
  const ERC20Interface = new Interface(ERC20ABI) as Erc20Interface;
  const balances = useMultipleContractSingleData(
    validatedTokenAddresses,
    ERC20Interface,
    'balanceOf',
    [address],
    // {
    //   gasRequired: 100_000,
    // },
  );

  const _balances = useMemo(
    () =>
      address && validatedTokens.length > 0
        ? validatedTokens.reduce<{
            [tokenAddress: string]: CurrencyAmount<Token> | undefined;
          }>((memo, token, i) => {
            const value = balances?.[i]?.result?.[0];
            const amount = value ? JSBI.BigInt(value.toString()) : undefined;
            if (amount) {
              memo[token.address] = CurrencyAmount.fromRawAmount(token, amount);
            }
            return memo;
          }, {})
        : {},
    [address, validatedTokens, balances],
  );
  const prevBalances = usePreviousNonEmptyObject(_balances);

  const anyLoading: boolean = useMemo(
    () => balances.some((callState) => callState.loading),
    [balances],
  );

  return useMemo(() => {
    if (!prevBalances) return [_balances, anyLoading];

    if (
      Object.keys(_balances).length === 0 &&
      Object.keys(_balances).length !== 0
    )
      return [prevBalances, anyLoading];

    return [_balances, anyLoading];
  }, [prevBalances, _balances, anyLoading]);
}

export function useTokenBalances(
  address?: string,
  tokens?: (Token | undefined)[],
): { [tokenAddress: string]: CurrencyAmount<Token> | undefined } {
  return useTokenBalancesWithLoadingIndicator(address, tokens)[0];
}

// get the balance for a single token/account combo
export function useTokenBalance(
  account?: string,
  token?: Token,
): CurrencyAmount<Token> | undefined {
  const tokenBalances = useTokenBalances(account, [token]);
  if (!token) return undefined;
  return tokenBalances[token.address];
}

export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined)[],
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(
    () =>
      currencies?.filter(
        (currency): currency is Token => currency?.isToken ?? false,
      ) ?? [],
    [currencies],
  );

  const tokenBalances = useTokenBalances(account, tokens);
  const containsETH: boolean = useMemo(
    () => currencies?.some((currency) => currency?.isNative) ?? false,
    [currencies],
  );
  const ethBalance = useETHBalances(containsETH ? [account] : []);

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined;
        if (currency.isToken) return tokenBalances[currency.address];
        if (currency.isNative) return ethBalance[account];
        return undefined;
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances],
  );
}

export function useCurrencyBalance(
  account?: string,
  currency?: Currency,
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(account, [currency])[0];
}

// mimics useAllBalances
export function useAllTokenBalances(): {
  [tokenAddress: string]: CurrencyAmount<Token> | undefined;
} {
  const { account } = useActiveWeb3React();
  const allTokens = useAllTokens();
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [
    allTokens,
  ]);
  const balances = useTokenBalances(account ?? undefined, []);
  //Todo: fix
  //   const balances = useTokenBalances(account ?? undefined, allTokensrray);
  return balances ?? {};
}

export async function getETHBalancesImmediately(
  multicallContract: Contract,
  chainId: ChainId,
  blockNumber: number,
  uncheckedAddresses?: (string | undefined)[],
): Promise<{
  [address: string]: CurrencyAmount<Currency> | undefined;
}> {
  const addresses: string[] = uncheckedAddresses
    ? uncheckedAddresses
        .map(isAddress)
        .filter((a): a is string => a !== false)
        .sort()
    : [];

  const results = await getSingleContractMultipleDataImmediately(
    multicallContract,
    'getEthBalance',
    addresses.map((address) => [address]),
    blockNumber,
  );

  const ret = addresses.reduce<{ [address: string]: CurrencyAmount<Currency> }>(
    (memo, address, i) => {
      const value = results?.[i]?.result?.[0];
      if (value && chainId) {
        memo[address] = CurrencyAmount.fromRawAmount(
          Ether.onChain(chainId),
          JSBI.BigInt(value.toString()),
        );
      }
      return memo;
    },
    {},
  );
  return ret;
}

export async function getTokenBalancesImmediately(
  multicallContract: Contract,
  blockNumber: number,
  address?: string,
  tokens?: (Token | undefined)[],
): Promise<{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }> {
  return (
    await getTokenBalancesWithLoadingIndicatorImmediately(
      multicallContract,
      blockNumber,
      address,
      tokens,
    )
  )[0];
}

export async function getTokenBalancesWithLoadingIndicatorImmediately(
  contract: Contract,
  blockNumber: number,
  address?: string,
  tokens?: (Token | undefined)[],
): Promise<
  [{ [tokenAddress: string]: CurrencyAmount<Token> | undefined }, boolean]
> {
  const validatedTokens: Token[] =
    tokens?.filter(
      (t?: Token): t is Token => isAddress(t?.address) !== false,
    ) ?? [];

  const validatedTokenAddresses = validatedTokens.map((vt) => vt.address);
  const ERC20Interface = new Interface(ERC20ABI) as Erc20Interface;
  const balances = await getMultipleContractSingleDataImmediately(
    contract,
    validatedTokenAddresses,
    ERC20Interface,
    blockNumber,
    'balanceOf',
    [address],
  );

  const anyLoading: boolean = balances.some((callState) => callState.loading);

  return [
    address && validatedTokens.length > 0
      ? validatedTokens.reduce<{
          [tokenAddress: string]: CurrencyAmount<Token> | undefined;
        }>((memo, token, i) => {
          const value = balances?.[i]?.result?.[0];
          const amount = value ? JSBI.BigInt(value.toString()) : undefined;
          if (amount) {
            memo[token.address] = CurrencyAmount.fromRawAmount(token, amount);
          }
          return memo;
        }, {})
      : {},
    anyLoading,
  ];
}

export async function getCurrencyBalancesImmediately(
  multicallContract: Contract,
  chainId: ChainId,
  blockNumber: number,
  account?: string,
  currencies?: (Currency | undefined)[],
): Promise<(CurrencyAmount<Currency> | undefined)[]> {
  const tokens =
    currencies?.filter(
      (currency): currency is Token => currency?.isToken ?? false,
    ) ?? [];

  const tokenBalances = await getTokenBalancesImmediately(
    multicallContract,
    blockNumber,
    account,
    tokens,
  );
  const containsETH: boolean =
    currencies?.some((currency) => currency?.isNative) ?? false;
  const ethBalance = await getETHBalancesImmediately(
    multicallContract,
    chainId,
    blockNumber,
    containsETH ? [account] : [],
  );

  return (
    currencies?.map((currency) => {
      if (!account || !currency) return undefined;
      if (currency.isToken) return tokenBalances[currency.address];
      if (currency.isNative) return ethBalance[account];
      return undefined;
    }) ?? []
  );
}

export async function getCurrencyBalanceImmediately(
  multicallContract: Contract,
  chainId: ChainId,
  blockNumber: number,
  account?: string,
  currency?: Currency,
): Promise<CurrencyAmount<Currency> | undefined> {
  return (
    await getCurrencyBalancesImmediately(
      multicallContract,
      chainId,
      blockNumber,
      account,
      [currency],
    )
  )[0];
}
