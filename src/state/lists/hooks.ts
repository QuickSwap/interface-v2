import { ChainId, Token } from '@uniswap/sdk';
import { Tags, TokenInfo, TokenList } from '@uniswap/token-lists';
import { GlobalConst } from 'constants/index';
import { useToken } from 'hooks/Tokens';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'state';

const {
  DEFAULT_TOKEN_LIST_URL,
  COINGECKO_POLYGON_TOKEN_LIST_URL,
  COINGECKO_POLYGON_ZKEVM_TOKEN_LIST_URL,
  COINGECKO_MANTA_TOKEN_LIST_URL,
  COINGECKO_IMMUTABLE_TOKEN_LIST_URL,
  COINGECKO_DOGE_TOKEN_LIST_URL,
  COINGECKO_KAVA_TOKEN_LIST_URL,
  COINGECKO_SONEIUM_TOKEN_LIST_URL,
} = GlobalConst.utils;

type TagDetails = Tags[keyof Tags];
export interface TagInfo extends TagDetails {
  id: string;
}

/**
 * Token instances created from token info.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo;
  public readonly tags: TagInfo[];
  public readonly isNative: boolean;
  public readonly isToken: boolean;
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(
      tokenInfo.chainId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name,
    );
    this.tokenInfo = tokenInfo;
    this.tags = tags;
    // Initialize Default values on V3 Style Tokens
    this.isNative = false;
    this.isToken = true;
  }
  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }
}

export type TokenAddressMap = Readonly<
  {
    [chainId in ChainId]: Readonly<{
      [tokenAddress: string]: WrappedTokenInfo;
    }>;
  }
>;

const EMPTY_LIST: TokenAddressMap = {
  [ChainId.ETHEREUM]: {},
  [ChainId.MUMBAI]: {},
  [ChainId.MATIC]: {},
  [ChainId.DOGECHAIN]: {},
  [ChainId.DOEGCHAIN_TESTNET]: {},
  [ChainId.ZKTESTNET]: {},
  [ChainId.ZKEVM]: {},
  [ChainId.MANTA]: {},
  [ChainId.KAVA]: {},
  [ChainId.ZKATANA]: {},
  [ChainId.BTTC]: {},
  [ChainId.X1]: {},
  [ChainId.TIMX]: {},
  [ChainId.IMX]: {},
  [ChainId.ASTARZKEVM]: {},
  [ChainId.LAYERX]: {},
  [ChainId.MINATO]: {},
  [ChainId.SONEIUM]: {},
  [ChainId.SOMNIA]: {},
};

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined'
    ? new WeakMap<TokenList, TokenAddressMap>()
    : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map((tagId) => {
            if (!list.tags?.[tagId]) return undefined;
            return { ...list.tags[tagId], id: tagId };
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? [];
      const token = new WrappedTokenInfo(tokenInfo, tags);
      if (
        tokenMap &&
        tokenMap[token.chainId] &&
        tokenMap[token.chainId][token.address] !== undefined
      ) {
        return tokenMap;
      }
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: token,
        },
      };
    },
    { ...EMPTY_LIST },
  );
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
  // return useTokenList(useSelectedListUrl());
  //TODO: Add support for selected list when @latest doesn't store the redirected url
  return useTokenList(DEFAULT_TOKEN_LIST_URL);
}

export function useInactiveTokenList(chainId: number): TokenAddressMap {
  let inactiveUrl = '';
  switch (chainId) {
    case ChainId.MATIC:
      inactiveUrl = COINGECKO_POLYGON_TOKEN_LIST_URL;
      break;
    case ChainId.ZKEVM:
      inactiveUrl = COINGECKO_POLYGON_ZKEVM_TOKEN_LIST_URL;
      break;
    case ChainId.MANTA:
      inactiveUrl = COINGECKO_MANTA_TOKEN_LIST_URL;
      break;
    case ChainId.IMX:
      inactiveUrl = COINGECKO_IMMUTABLE_TOKEN_LIST_URL;
      break;
    case ChainId.DOGECHAIN:
      inactiveUrl = COINGECKO_DOGE_TOKEN_LIST_URL;
      break;
    case ChainId.KAVA:
      inactiveUrl = COINGECKO_KAVA_TOKEN_LIST_URL;
      break;
    case ChainId.SONEIUM:
      inactiveUrl = COINGECKO_SONEIUM_TOKEN_LIST_URL;
      break;
    default:
      break;
  }
  return useTokenList(inactiveUrl);
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
