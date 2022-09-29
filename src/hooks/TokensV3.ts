import { parseBytes32String } from '@ethersproject/strings';
import { Token } from '@uniswap/sdk-core';
import { arrayify } from 'ethers/lib/utils';
import { useMemo } from 'react';
import { NEVER_RELOAD, useSingleCallResult } from '../state/multicall/v3/hooks';
import { isAddress } from '../utils';

import { useActiveWeb3React } from 'hooks';
import { useBytes32TokenContract, useTokenContract } from './useContract';
import { useSelectedTokenList } from 'state/lists/hooks';
import { ChainId } from '@uniswap/sdk';

// parse a name or symbol from a token response
const BYTES32_REGEX = /^0x[a-fA-F0-9]{64}$/;

function parseStringOrBytes32(
  str: string | undefined,
  bytes32: string | undefined,
  defaultValue: string,
): string {
  return str && str.length > 0
    ? str
    : // need to check for proper bytes string and valid terminator
    bytes32 && BYTES32_REGEX.test(bytes32) && arrayify(bytes32)[31] === 0
    ? parseBytes32String(bytes32)
    : defaultValue;
}

// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useToken(tokenAddress?: string): Token | undefined | null {
  const { chainId } = useActiveWeb3React();
  const tokens = useSelectedTokenList();

  const address = isAddress(tokenAddress);

  const tokenContract = useTokenContract(address ? address : undefined, false);
  const tokenContractBytes32 = useBytes32TokenContract(
    address ? address : undefined,
    false,
  );

  let token: Token | undefined = undefined;
  if (address) {
    const chainIdOrDefault = chainId ?? ChainId.MATIC;
    const oldToken = tokens[chainIdOrDefault][address];
    if (oldToken) {
      token = new Token(
        chainIdOrDefault,
        oldToken.address,
        oldToken.decimals,
        oldToken.symbol,
        oldToken.name,
      );
    }
  }

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
    if (!chainId || !address) return undefined;
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
