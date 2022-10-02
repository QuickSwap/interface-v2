import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHER as NATIVE,
  Token,
  TokenAmount,
  WETH,
} from '@uniswap/sdk';

import { Currency as CurrencyV3, Token as TokenV3 } from '@uniswap/sdk-core';
import { WNATIVE_EXTENDED } from 'constants/v3/addresses';
import { WrappedTokenInfo } from 'state/lists/v3/wrappedTokenInfo';
import { V3Currency } from 'v3lib/entities/v3Currency';

export function wrappedCurrency(
  currency: Currency | undefined,
  chainId: ChainId | undefined,
): Token | undefined {
  return chainId && currency === NATIVE[chainId ? chainId : ChainId.MATIC]
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
    ? WNATIVE_EXTENDED[chainId ?? ChainId.MATIC]
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

export function unwrappedToken(token: Token | TokenV3): Currency {
  if (token instanceof Token && token.equals(WETH[token.chainId]))
    return NATIVE[token.chainId];
  if (token instanceof TokenV3 && token.equals(WNATIVE_EXTENDED[token.chainId]))
    return new V3Currency(
      token.chainId,
      token.decimals,
      token.symbol,
      token.name,
    );
  return token;
}
