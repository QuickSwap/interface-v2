import { Token, TokenAmount } from '@uniswap/sdk';
import { useMemo } from 'react';
import { useAllTokenBalances } from 'state/wallet/hooks';
import { useUSDCPricesFromAddresses } from 'utils/useUSDCPrice';

function balanceComparator(balanceA?: TokenAmount, balanceB?: TokenAmount) {
  if (balanceA && balanceB) {
    return balanceA.greaterThan(balanceB)
      ? -1
      : balanceA.equalTo(balanceB)
      ? 0
      : 1;
  } else if (balanceA && balanceA.greaterThan('0')) {
    return -1;
  } else if (balanceB && balanceB.greaterThan('0')) {
    return 1;
  }
  return 0;
}

function balanceComparator2(balanceA: number, balanceB: number) {
  return balanceA > balanceB ? -1 : balanceA === balanceB ? 0 : 1;
}

function getTokenComparator(
  balances: {
    [tokenAddress: string]: TokenAmount | undefined;
  },
  prices: {
    address: string;
    price: any;
  }[],
): (tokenA: Token, tokenB: Token) => number {
  const pricesMap: any = prices.reduce(
    (_map, price) => ({
      ..._map,
      [price.address]: price.price,
    }),
    {},
  );

  return function sortTokens(tokenA: Token, tokenB: Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = Number(balances[tokenA.address]?.toExact()) || 0;
    const balanceB = Number(balances[tokenB.address]?.toExact()) || 0;
    const priceA = pricesMap[tokenA.address] || 0;
    const priceB = pricesMap[tokenB.address] || 0;

    const balanceComp = balanceComparator2(
      balanceA * priceA,
      balanceB * priceB,
    );
    if (balanceComp !== 0) return balanceComp;

    if (tokenA.symbol && tokenB.symbol) {
      // sort by symbol
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1;
    } else {
      return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0;
    }
  };
}

export function useTokenComparator(
  inverted: boolean,
): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances();
  const tokenAddresses = Object.keys(balances);
  const { prices } = useUSDCPricesFromAddresses(tokenAddresses);
  const comparator = useMemo(() => getTokenComparator(balances ?? {}, prices), [
    prices,
    balances,
  ]);
  return useMemo(() => {
    if (inverted) {
      return (tokenA: Token, tokenB: Token) => comparator(tokenA, tokenB) * -1;
    } else {
      return comparator;
    }
  }, [inverted, comparator]);
}
