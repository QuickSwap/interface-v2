import { parseBytes32String } from '@ethersproject/strings';
import { Currency, Token } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { NEVER_RELOAD, useSingleCallResult } from 'state/multicall/v3/hooks';
import { useUserAddedTokens } from 'state/user/hooks';
import { isAddress } from 'utils';

import { useActiveWeb3React } from 'hooks';
import { useBytes32TokenContract, useTokenContract } from 'hooks/useContract';
import {
  ExtendedEther,
  NATIVE_TOKEN_ADDRESS,
  WMATIC_EXTENDED,
} from 'constants/v3/addresses';
import { TokenAddressMap, useSelectedTokenList } from 'state/lists/v3/hooks';
import { ChainId } from '@uniswap/sdk';
import { CHAIN_INFO } from 'constants/v3/chains';

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(
  tokenMap: TokenAddressMap,
  includeUserAdded: boolean,
): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React();

  return useMemo(() => {
    if (!chainId) return {};

    // reduce to just tokens
    const mapWithoutUrls = Object.keys(tokenMap[chainId] ?? {}).reduce<{
      [address: string]: Token;
    }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token;
      return newMap;
    }, {});

    const userAddedTokens: Token[] = []; /// useUserAddedTokens();

    if (includeUserAdded) {
      return (
        userAddedTokens
          // reduce into all ALL_TOKENS filtered by the current chain
          .reduce<{ [address: string]: Token }>(
            (tokenMap, token) => {
              tokenMap[token.address] = token;
              return tokenMap;
            },
            // must make a copy because reduce modifies the map, and we do not
            // want to make a copy in every iteration
            { ...mapWithoutUrls },
          )
      );
    }

    return mapWithoutUrls;
  }, [chainId, tokenMap, includeUserAdded]);
}

export function useAllTokens(): { [address: string]: Token } {
  const { chainId } = useActiveWeb3React();

  const allTokens = useSelectedTokenList();

  return useTokensFromMap(allTokens, true);
}

export function useIsTokenActive(token: Token | undefined | null): boolean {
  const activeTokens = useAllTokens();

  if (!activeTokens || !token) {
    return false;
  }

  return !!activeTokens[token.address];
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(
  currency: Currency | undefined | null,
): boolean {
  const userAddedTokens: Token[] = []; //useUserAddedTokens();

  if (!currency) {
    return false;
  }

  return !!userAddedTokens.find((token) => currency.equals(token));
}

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;
function parseStringOrBytes32(
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string,
): string {
  return str && str.length > 0
    ? str
    : bytes32 && BYTES32_REGEX.test(bytes32)
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveWeb3React();
  const tokens = useAllTokens();

  const address = isAddress(tokenAddress);

  const tokenContract = useTokenContract(address ? address : undefined, false);
  const tokenContractBytes32 = useBytes32TokenContract(
    address ? address : undefined,
    false,
  );
  const token: Token | undefined = address ? tokens[address] : undefined;

  const tokenName = useSingleCallResult(
    token ? undefined : tokenContract,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const tokenNameBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'name',
    undefined,
    NEVER_RELOAD,
  );
  const symbol = useSingleCallResult(
    token ? undefined : tokenContract,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const symbolBytes32 = useSingleCallResult(
    token ? undefined : tokenContractBytes32,
    'symbol',
    undefined,
    NEVER_RELOAD,
  );
  const decimals = useSingleCallResult(
    token ? undefined : tokenContract,
    'decimals',
    undefined,
    NEVER_RELOAD,
  );

  return useMemo(() => {
    if (token) return token;
    if (!chainId || !address) return null;
    if (decimals.loading || symbol.loading || tokenName.loading) return null;
    if (decimals.result) {
      return new Token(
        chainId,
        address,
        decimals.result[0],
        parseStringOrBytes32(
          symbol.result?.[0],
          symbolBytes32.result?.[0],
          'UNKNOWN',
        ),
        parseStringOrBytes32(
          tokenName.result?.[0],
          tokenNameBytes32.result?.[0],
          'Unknown Token',
        ),
      );
    }
    return undefined;
  }, [
    address,
    chainId,
    decimals.loading,
    decimals.result,
    symbol.loading,
    symbol.result,
    symbolBytes32.result,
    token,
    tokenName.loading,
    tokenName.result,
    tokenNameBytes32.result,
  ]);
}

export function useCurrency(
  currencyId: string | undefined,
): Currency | null | undefined {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const chainInfo = CHAIN_INFO[chainIdToUse];

  const isETH =
    chainInfo &&
    currencyId &&
    (currencyId === 'ETH' ||
      currencyId === NATIVE_TOKEN_ADDRESS ||
      currencyId?.toUpperCase() ===
        chainInfo.nativeCurrencySymbol.toUpperCase());

  const token = useToken(isETH ? undefined : currencyId);
  const extendedEther = useMemo(
    () =>
      chainId
        ? ExtendedEther.onChain(
            chainId,
            chainInfo.nativeCurrencyDecimals,
            chainInfo.nativeCurrencySymbol,
            chainInfo.nativeCurrencyName,
          )
        : undefined,
    [
      chainId,
      chainInfo.nativeCurrencyDecimals,
      chainInfo.nativeCurrencyName,
      chainInfo.nativeCurrencySymbol,
    ],
  );
  const weth = chainId ? WMATIC_EXTENDED[chainId] : undefined;
  if (weth?.address?.toLowerCase() === currencyId?.toLowerCase()) return weth;
  return isETH ? extendedEther : token;
}
