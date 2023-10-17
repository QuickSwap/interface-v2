import JSBI from 'jsbi';
import {
  Currency,
  CurrencyAmount,
  Fraction,
  Percent,
  TradeType,
} from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/src/trade';
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from 'constants/v3/misc';
import { FeeAmount } from 'v3lib/utils';

const THIRTY_BIPS_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000));
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000));
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(THIRTY_BIPS_FEE);

// computes realized lp fee as a percent
export function computeRealizedLPFeePercent(
  trade: V3Trade<Currency, Currency, TradeType>,
): Percent {
  const percent = ONE_HUNDRED_PERCENT.subtract(
    trade.route.pools.reduce<Percent>(
      (currentFee: Percent, pool): Percent =>
        currentFee.multiply(
          ONE_HUNDRED_PERCENT.subtract(
            new Fraction(pool.fee ?? FeeAmount.LOWEST, 1_000_000),
          ),
        ),
      ONE_HUNDRED_PERCENT,
    ),
  );

  return new Percent(percent.numerator, percent.denominator);
}

// computes price breakdown for the trade
export function computeRealizedLPFeeAmount(
  trade?: V3Trade<Currency, Currency, TradeType> | null,
): CurrencyAmount<Currency> | undefined {
  if (trade) {
    const realizedLPFee = computeRealizedLPFeePercent(trade);

    // the amount of the input that accrues to LPs
    return CurrencyAmount.fromRawAmount(
      trade.inputAmount.currency,
      trade.inputAmount.multiply(realizedLPFee).quotient,
    );
  }

  return undefined;
}

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
];

type WarningSeverity = 0 | 1 | 2 | 3 | 4;

export function warningSeverity(
  priceImpact: Percent | undefined,
): WarningSeverity {
  if (!priceImpact) return 4;
  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity;
  for (const impactLevel of IMPACT_TIERS) {
    if (impactLevel.lessThan(priceImpact)) return impact;
    impact--;
  }
  return 0;
}
