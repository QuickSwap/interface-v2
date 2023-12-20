import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core';
import { useActiveWeb3React } from 'hooks';
import { useMemo } from 'react';
import { useBestV3TradeExactOut } from './useBestV3Trade';
import { ChainId } from '@uniswap/sdk';
import { toV3Token, USDC } from 'constants/v3/addresses';

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(
  currency?: Currency,
  allLiquidity?: boolean,
): Price<Currency, Token> | undefined {
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;

  const USDC_TOKEN = USDC[chainIdToUse];
  const USDC_V3_TOKEN = USDC_TOKEN ? toV3Token(USDC_TOKEN) : undefined;
  const STABLECOIN_AMOUNT_OUT_ALL:
    | CurrencyAmount<Token>
    | undefined = USDC_V3_TOKEN
    ? CurrencyAmount.fromRawAmount(USDC_V3_TOKEN, 1)
    : undefined;
  const STABLECOIN_AMOUNT_OUT_FILTERED:
    | CurrencyAmount<Token>
    | undefined = USDC_V3_TOKEN
    ? CurrencyAmount.fromRawAmount(USDC_V3_TOKEN, 100_000e1)
    : undefined;

  const amountOut = chainId
    ? allLiquidity
      ? STABLECOIN_AMOUNT_OUT_ALL
      : STABLECOIN_AMOUNT_OUT_FILTERED
    : undefined;
  const stablecoin = amountOut?.currency;

  const v3USDCTrade = useBestV3TradeExactOut(currency, amountOut);

  return useMemo(() => {
    if (!currency || !stablecoin) {
      return undefined;
    }

    // handle usdc
    if (currency?.wrapped.equals(stablecoin)) {
      return new Price(stablecoin, stablecoin, '1', '1');
    }

    if (v3USDCTrade.trade) {
      const { numerator, denominator } = v3USDCTrade.trade.route.midPrice;
      return new Price(currency, stablecoin, denominator, numerator);
    }

    return undefined;
  }, [currency, stablecoin, v3USDCTrade.trade]);
}

export function useUSDCValue(
  currencyAmount: CurrencyAmount<Currency> | undefined | null,
  allLiquidity = false,
) {
  const price = useUSDCPrice(currencyAmount?.currency, allLiquidity);

  return useMemo(() => {
    if (!price || !currencyAmount) return null;
    try {
      return price.quote(currencyAmount);
    } catch (error) {
      return null;
    }
  }, [currencyAmount, price]);
}
