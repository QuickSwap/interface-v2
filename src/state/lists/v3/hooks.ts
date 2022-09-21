import { ChainId } from '@uniswap/sdk';
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';
import { WrappedTokenInfo } from './wrappedTokenInfo';

export type TokenAddressMap = Readonly<{
  [chainId: number]: Readonly<{
    [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList };
  }>;
}>;

type Mutable<T> = {
  -readonly [P in keyof T]: Mutable<T[P]>;
};

/**
 * An empty result, useful as a default.
 */
const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
};

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<TokenList, TokenAddressMap>()
    : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const map = list.tokens.reduce<Mutable<TokenAddressMap>>(
    (tokenMap, tokenInfo) => {
      const token = new WrappedTokenInfo(tokenInfo, list);
      if (tokenMap[token.chainId]?.[token.address] !== undefined) {
        console.error(`Duplicate token! ${token.address}`);
        return tokenMap;
      }
      if (!tokenMap[token.chainId]) tokenMap[token.chainId] = {};
      tokenMap[token.chainId][token.address] = {
        token,
        list,
      };
      return tokenMap;
    },
    {},
  ) as TokenAddressMap;
  listCache?.set(list, map);
  return map;
}

export function useTokenList(url: string | undefined): TokenAddressMap {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  return useMemo(() => {
    if (!url) return EMPTY_LIST;
    const current = lists[url]?.current;
    if (!current) return EMPTY_LIST;
    try {
      return listToTokenMap(current);
    } catch (error) {
      console.error('Could not show token list due to error', error);
      return EMPTY_LIST;
    }
  }, [lists, url]);
}

export function useSelectedListUrl(): string | undefined {
  return useSelector<AppState, AppState['lists']['selectedListUrl']>(
    (state) => state.lists.selectedListUrl,
  );
}

export function useSelectedTokenList(): TokenAddressMap {
  return useTokenList(useSelectedListUrl());
}

export function useSelectedListInfo(): {
  current: TokenList | null;
  pending: TokenList | null;
  loading: boolean;
} {
  const selectedUrl = useSelectedListUrl();
  const listsByUrl = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );
  const list = selectedUrl ? listsByUrl[selectedUrl] : undefined;

  return {
    current: list?.current ?? null,
    pending: list?.pendingUpdate ?? null,
    loading: list?.loadingRequestId !== null,
  };
}

// returns all downloaded current lists
export function useAllLists(): TokenList[] {
  const lists = useSelector<AppState, AppState['lists']['byUrl']>(
    (state) => state.lists.byUrl,
  );

  return useMemo(
    () =>
      Object.keys(lists)
        .map((url) => lists[url].current)
        .filter((l): l is TokenList => Boolean(l)),
    [lists],
  );
}
