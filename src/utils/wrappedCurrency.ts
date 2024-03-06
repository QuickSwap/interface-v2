import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHER,
  Token,
  TokenAmount,
  WETH,
} from '@uniswap/sdk';

import {
  Currency as CurrencyV3,
  Token as TokenV3,
  NativeCurrency,
} from '@uniswap/sdk-core';
import { WMATIC_EXTENDED } from '~/constants/v3/addresses';
import { WrappedTokenInfo } from '~/state/lists/v3/wrappedTokenInfo';

export function wrappedCurrency(
  currency: Currency | undefined,
  chainId: ChainId | undefined,
): Token | undefined {
  return chainId && currency === ETHER[chainId ? chainId : ChainId.MATIC]
    ? WETH[chainId]
    : currency instanceof Token && currency.chainId === chainId
    ? currency
    : undefined;
}

export function wrappedCurrencyV3(
  currency: CurrencyV3 | undefined,
  chainId: ChainId | undefined,
): TokenV3 | undefined {
  return currency?.isNative
    ? WMATIC_EXTENDED[chainId ?? ChainId.MATIC]
    : currency instanceof WrappedTokenInfo
    ? currency
    : currency instanceof TokenV3
    ? currency
    : undefined;
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount | undefined,
  chainId: ChainId | undefined,
): TokenAmount | undefined {
  const token =
    currencyAmount && chainId
      ? wrappedCurrency(currencyAmount.currency, chainId)
      : undefined;
  return token && currencyAmount
    ? new TokenAmount(token, currencyAmount.raw)
    : undefined;
}

export function unwrappedToken(token: Token | TokenV3) {
  if (token instanceof Token && token.equals(WETH[token.chainId]))
    return ETHER[token.chainId];
  if (
    token instanceof TokenV3 &&
    token.equals(WMATIC_EXTENDED[token.chainId])
  ) {
    const nativeCurrency = ETHER[token.chainId as ChainId];
    return {
      ...nativeCurrency,
      isNative: true,
      isToken: false,
    } as NativeCurrency;
  }
  return token;
}
