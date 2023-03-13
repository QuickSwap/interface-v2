import { useMemo } from 'react';
//@ts-ignore
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { Interface } from '@ethersproject/abi';
import { useMultipleContractSingleData } from 'state/multicall/v3/hooks';
import { Currency, CurrencyAmount, Percent, Token } from '@uniswap/sdk-core';
import { computePairAddress, Pair } from 'utils/v3/computePairAddress';
import {
  EXCHANGE_FACTORY_ADDRESS_MAPS,
  EXCHANGE_PAIR_INIT_HASH_MAPS,
  V2Exchanges,
  V2_FACTORY_ADDRESSES,
} from 'constants/v3/addresses';
import { useActiveWeb3React } from 'hooks';
import flatMap from 'lodash.flatmap';
import {
  BASES_TO_TRACK_LIQUIDITY_FOR,
  PINNED_PAIRS,
} from 'constants/v3/routing';
import { useAppSelector } from 'state';
import { useAllTokens } from './Tokens';
import { SerializedToken } from 'state/user/actions';
// import { Pair } from "@uniswap/v2-sdk"

const PAIR_INTERFACE = new Interface(IUniswapV2PairABI.abi);

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}

export function useV2Pairs(
  currencies: [Currency | undefined, Currency | undefined][],
  v2Exchange: V2Exchanges = V2Exchanges.Quickswap,
): [PairState, Pair | null][] {
  const tokens = useMemo(
    () =>
      currencies.map(([currencyA, currencyB]) => [
        currencyA?.wrapped,
        currencyB?.wrapped,
      ]),
    [currencies],
  );

  //TODO: Support Multichain
  const pairAddresses = useMemo(
    () =>
      tokens.map(([tokenA, tokenB]) => {
        return tokenA &&
          tokenB &&
          tokenA.chainId === tokenB.chainId &&
          !tokenA.equals(tokenB) &&
          //TODO: update to verify EXCHANGE_FACTORY_ADDRESS_MAPS && EXCHANGE_PAIR_INIT_HASH_MAPS values exist
          V2_FACTORY_ADDRESSES[tokenA.chainId]
          ? computePairAddress({
              tokenA,
              tokenB,
              exchange: v2Exchange,
            })
          : undefined;
      }),
    [tokens, v2Exchange],
  );

  const results = useMultipleContractSingleData(
    pairAddresses,
    PAIR_INTERFACE,
    'getReserves',
  );

  return useMemo(() => {
    return results.map((result, i) => {
      const { result: reserves, loading } = result;
      const tokenA = tokens[i][0];
      const tokenB = tokens[i][1];

      if (loading) return [PairState.LOADING, null];
      if (!tokenA || !tokenB || tokenA.equals(tokenB))
        return [PairState.INVALID, null];
      if (!reserves) return [PairState.NOT_EXISTS, null];
      const { reserve0, reserve1 } = reserves;
      const [token0, token1] = tokenA.sortsBefore(tokenB)
        ? [tokenA, tokenB]
        : [tokenB, tokenA];
      return [
        PairState.EXISTS,
        new Pair(
          CurrencyAmount.fromRawAmount(token0, reserve0.toString()),
          CurrencyAmount.fromRawAmount(token1, reserve1.toString()),
          v2Exchange,
        ),
      ];
    });
  }, [results, tokens, v2Exchange]);
}

export function useV2Pair(
  tokenA?: Currency,
  tokenB?: Currency,
  exchange: V2Exchanges = V2Exchanges.Quickswap,
): [PairState, Pair | null] {
  const inputs: [[Currency | undefined, Currency | undefined]] = useMemo(
    () => [[tokenA, tokenB]],
    [tokenA, tokenB],
  );
  return useV2Pairs(inputs, exchange)[0];
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}

/**
 * Returns all the pairs of tokens that are tracked by the user for the current chain ID.
 */
export function useTrackedTokenPairs(): [Token, Token][] {
  const { chainId } = useActiveWeb3React();
  const tokens = useAllTokens();

  // pinned pairs
  const pinnedPairs = useMemo(
    () => (chainId ? PINNED_PAIRS[chainId] ?? [] : []),
    [chainId],
  );

  // pairs for every token against every base
  const generatedPairs: [Token, Token][] = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress];
            // for each token on the current chain,
            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null;
                  } else {
                    return [base, token];
                  }
                })
                .filter((p): p is [Token, Token] => p !== null)
            );
          })
        : [],
    [tokens, chainId],
  );

  // pairs saved by users
  const savedSerializedPairs = useAppSelector(({ user: { pairs } }) => pairs);

  const userPairs: [Token, Token][] = useMemo(() => {
    if (!chainId || !savedSerializedPairs) return [];
    const forChain = savedSerializedPairs[chainId];
    if (!forChain) return [];

    return Object.keys(forChain).map((pairId) => {
      return [
        deserializeToken(forChain[pairId].token0),
        deserializeToken(forChain[pairId].token1),
      ];
    });
  }, [savedSerializedPairs, chainId]);

  const combinedList = useMemo(
    () => userPairs.concat(generatedPairs).concat(pinnedPairs),
    [generatedPairs, pinnedPairs, userPairs],
  );

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce<{ [key: string]: [Token, Token] }>(
      (memo, [tokenA, tokenB]) => {
        const sorted = tokenA.sortsBefore(tokenB);
        const key = sorted
          ? `${tokenA.address}:${tokenB.address}`
          : `${tokenB.address}:${tokenA.address}`;
        if (memo[key]) return memo;
        memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA];
        return memo;
      },
      {},
    );

    return Object.keys(keyed).map((key) => keyed[key]);
  }, [combinedList]);
}
