import { Percent, Token } from '@uniswap/sdk-core';
import { SupportedLocale } from 'constants/v3/locales';
import JSBI from 'jsbi';
import flatMap from 'lodash.flatmap';
import { useCallback, useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { computePairAddress, Pair } from 'utils/v3/computePairAddress';
import { AppState } from '../../index';
import {
  addSerializedPair,
  addSerializedToken,
  removeSerializedToken,
  SerializedPair,
  SerializedToken,
  updateHideClosedPositions,
  updateHideFarmingPositions,
  updateUserDarkMode,
  updateUserDeadline,
  updateUserExpertMode,
  updateUserLocale,
  updateUserSingleHopOnly,
  updateUserSlippageTolerance,
} from './actions';
import { useActiveWeb3React } from 'hooks';
import { V2_FACTORY_ADDRESSES } from 'constants/v3/addresses';
import {
  BASES_TO_TRACK_LIQUIDITY_FOR,
  PINNED_PAIRS,
} from 'constants/v3/routing';
import { useAllTokens } from 'hooks/v3/Tokens';

function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  };
}

function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useAppSelector(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual,
  );

  return true;
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch();
  const darkMode = useIsDarkMode();

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }));
  }, [darkMode, dispatch]);

  return [darkMode, toggleSetDarkMode];
}

export function useUserLocale(): SupportedLocale | null {
  return useAppSelector((state) => state.userV3.userLocale);
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  if (tokenA.chainId !== tokenB.chainId)
    throw new Error('Not matching chain IDs');
  if (tokenA.equals(tokenB)) throw new Error('Tokens cannot be equal');
  if (!V2_FACTORY_ADDRESSES[tokenA.chainId])
    throw new Error('No V2 factory address on this chain');

  return new Token(
    tokenA.chainId,
    computePairAddress({
      factoryAddress: V2_FACTORY_ADDRESSES[tokenA.chainId],
      tokenA,
      tokenB,
    }),
    18,
    'QUICKSWAP-V2',
    'QUICKSWAP V2',
  );
}

export function useUserLocaleManager(): [
  SupportedLocale | null,
  (newLocale: SupportedLocale) => void,
] {
  const dispatch = useAppDispatch();
  const locale = useUserLocale();

  const setLocale = useCallback(
    (newLocale: SupportedLocale) => {
      dispatch(updateUserLocale({ userLocale: newLocale }));
    },
    [dispatch],
  );

  return [locale, setLocale];
}

export function useIsExpertMode(): boolean {
  return useAppSelector((state) => state.userV3.userExpertMode);
}

export function useExpertModeManager(): [boolean, () => void] {
  const dispatch = useAppDispatch();
  const expertMode = useIsExpertMode();

  const toggleSetExpertMode = useCallback(() => {
    dispatch(updateUserExpertMode({ userExpertMode: !expertMode }));
  }, [expertMode, dispatch]);

  return [expertMode, toggleSetExpertMode];
}

export function useUserSingleHopOnly(): [
  boolean,
  (newSingleHopOnly: boolean) => void,
] {
  const dispatch = useAppDispatch();

  const singleHopOnly = useAppSelector(
    (state) => state.userV3.userSingleHopOnly,
  );

  const setSingleHopOnly = useCallback(
    (newSingleHopOnly: boolean) => {
      dispatch(
        updateUserSingleHopOnly({ userSingleHopOnly: newSingleHopOnly }),
      );
    },
    [dispatch],
  );

  return [singleHopOnly, setSingleHopOnly];
}

export function useSetUserSlippageTolerance(): (
  slippageTolerance: Percent | 'auto',
) => void {
  const dispatch = useAppDispatch();

  return useCallback(
    (userSlippageTolerance: Percent | 'auto') => {
      let value: 'auto' | number;
      try {
        value =
          userSlippageTolerance === 'auto'
            ? 'auto'
            : JSBI.toNumber(userSlippageTolerance.multiply(10_000).quotient);
      } catch (error) {
        value = 'auto';
      }
      dispatch(
        updateUserSlippageTolerance({
          userSlippageTolerance: value,
        }),
      );
    },
    [dispatch],
  );
}

/**
 * Return the user's slippage tolerance, from the redux store, and a function to update the slippage tolerance
 */
export function useUserSlippageTolerance(): Percent | 'auto' {
  const userSlippageTolerance = useAppSelector((state) => {
    return state.userV3.userSlippageTolerance;
  });

  return useMemo(
    () =>
      userSlippageTolerance === 'auto'
        ? 'auto'
        : new Percent(userSlippageTolerance, 10_000),
    [userSlippageTolerance],
  );
}

export function useUserHideClosedPositions(): [
  boolean,
  (newHideClosedPositions: boolean) => void,
] {
  const dispatch = useAppDispatch();

  const hideClosedPositions = useAppSelector(
    (state) => state.userV3.userHideClosedPositions,
  );

  const setHideClosedPositions = useCallback(
    (newHideClosedPositions: boolean) => {
      dispatch(
        updateHideClosedPositions({
          userHideClosedPositions: newHideClosedPositions,
        }),
      );
    },
    [dispatch],
  );

  return [hideClosedPositions, setHideClosedPositions];
}

export function useUserHideFarmingPositions(): [
  boolean,
  (newHideFarmingPositions: boolean) => void,
] {
  const dispatch = useAppDispatch();

  const hideFarmingPositions = useAppSelector(
    (state) => state.userV3.userHideFarmingPositions,
  );

  const setHideFarmingPositions = useCallback(
    (newHideFarmingPositions: boolean) => {
      dispatch(
        updateHideFarmingPositions({
          userHideFarmingPositions: newHideFarmingPositions,
        }),
      );
    },
    [dispatch],
  );

  return [hideFarmingPositions, setHideFarmingPositions];
}

/**
 * Same as above but replaces the auto with a default value
 * @param defaultSlippageTolerance the default value to replace auto with
 */
export function useUserSlippageToleranceWithDefault(
  defaultSlippageTolerance: Percent,
): Percent {
  const allowedSlippage = useUserSlippageTolerance();
  return useMemo(
    () =>
      allowedSlippage === 'auto' ? defaultSlippageTolerance : allowedSlippage,
    [allowedSlippage, defaultSlippageTolerance],
  );
}

export function useUserTransactionTTL(): [number, (slippage: number) => void] {
  const dispatch = useAppDispatch();
  const deadline = useAppSelector((state) => state.userV3.userDeadline);

  const setUserDeadline = useCallback(
    (userDeadline: number) => {
      dispatch(updateUserDeadline({ userDeadline }));
    },
    [dispatch],
  );

  return [deadline, setUserDeadline];
}

export function useAddUserToken(): (token: Token) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (token: Token) => {
      dispatch(addSerializedToken({ serializedToken: serializeToken(token) }));
    },
    [dispatch],
  );
}

export function useRemoveUserAddedToken(): (
  chainId: number,
  address: string,
) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (chainId: number, address: string) => {
      dispatch(removeSerializedToken({ chainId, address }));
    },
    [dispatch],
  );
}

export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React();
  const serializedTokensMap = useAppSelector(({ user: { tokens } }) => tokens);

  // console.log(serializedTokensMap, 'tokMapppp')

  // useEffect(() => {
  //     fetchList('https://unpkg.com/quickswap-default-token-list@1.0.39/build/quickswap-default.tokenlist.json')
  //         .then(res => {
  //             let stepTokens = {}
  //             res.tokens.map(item => {
  //                 if (item.chainId === 137) {
  //                     stepTokens = {...stepTokens, [item.address]: item}
  //                 }
  //             })
  //             setMap({137: stepTokens})
  //         })
  // }, [])

  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(serializedTokensMap?.[chainId] ?? {}).map(
      deserializeToken,
    );
  }, [serializedTokensMap, chainId]);
}

function serializePair(pair: Pair): SerializedPair {
  return {
    token0: serializeToken(pair.token0),
    token1: serializeToken(pair.token1),
  };
}

export function usePairAdder(): (pair: Pair) => void {
  const dispatch = useAppDispatch();

  return useCallback(
    (pair: Pair) => {
      dispatch(addSerializedPair({ serializedPair: serializePair(pair) }));
    },
    [dispatch],
  );
}

export function useURLWarningVisible(): boolean {
  return useAppSelector((state: AppState) => state.userV3.URLWarningVisible);
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
        // console.log(tokenA, tokenB, 'kekeke')
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
