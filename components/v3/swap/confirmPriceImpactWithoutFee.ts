import { Percent } from '@uniswap/sdk-core';
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
} from 'constants/v3/misc';
import { TFunction } from 'react-i18next';

/**
 * Given the price impact, get user confirmation.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 */
export default function confirmPriceImpactWithoutFee(
  priceImpactWithoutFee: Percent,
  translation: TFunction,
): boolean {
  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    return (
      window.prompt(
        translation('typeConfirmSwapPriceImpact', {
          priceImpact: PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(0),
        }),
      ) === 'confirm'
    );
  } else if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return window.confirm(
      translation('confirmSwapPriceImpact', {
        priceImpact: ALLOWED_PRICE_IMPACT_HIGH.toFixed(0),
      }),
    );
  }
  return true;
}
