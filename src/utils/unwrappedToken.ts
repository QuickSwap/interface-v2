import { Currency } from '@uniswap/sdk-core';
import { ExtendedEther, WMATIC_EXTENDED } from '../constants/v3/addresses';
import { supportedChainId } from './supportedChainId';

export function unwrappedToken(currency: Currency): Currency {
  if (currency.isNative) return currency;
  const formattedChainId = supportedChainId(currency.chainId);
  if (formattedChainId && currency.equals(WMATIC_EXTENDED[formattedChainId]))
    return ExtendedEther.onChain(
      currency.chainId,
      currency.decimals,
      currency.symbol,
      currency.name,
    );
  return currency;
}
