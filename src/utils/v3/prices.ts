import JSBI from 'jsbi';
import {
  Currency,
  CurrencyAmount,
  Fraction,
  Percent,
  TradeType,
} from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/trade';
import {
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
} from 'constants/v3/misc';
import { FeeAmount } from 'v3lib/utils';

const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000));

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

export function computeZapPriceBreakdown(
  trade?: V3Trade<Currency, Currency, TradeType> | null,
): {
  priceImpactWithoutFee: Percent | undefined;
  realizedLPFee: CurrencyAmount<Currency> | undefined | null;
} {
  const baseFee = new Percent(JSBI.BigInt(20), JSBI.BigInt(10000));
  const inputFractionAfterFee = ONE_HUNDRED_PERCENT.subtract(baseFee);

  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        // @ts-ignore
        trade.routes?.[0]?.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction =>
            currentFee.multiply(inputFractionAfterFee),
          ONE_HUNDRED_PERCENT,
        ),
      );

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction =
    trade && realizedLPFee
      ? trade.priceImpact.subtract(realizedLPFee)
      : undefined;

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(
        priceImpactWithoutFeeFraction?.numerator,
        priceImpactWithoutFeeFraction?.denominator,
      )
    : undefined;

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    CurrencyAmount.fromRawAmount(
      trade.inputAmount.currency,
      trade.inputAmount.multiply(realizedLPFee).quotient,
    );

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  };
}
