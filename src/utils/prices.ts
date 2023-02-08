import { GlobalValue } from 'constants/index';
import {
  CurrencyAmount,
  Fraction,
  JSBI,
  Percent,
  TokenAmount,
  Trade,
} from '@uniswap/sdk';
import { Percent as PercentV3 } from '@uniswap/sdk-core';
import { Field } from 'state/swap/actions';
import { basisPointsToPercent } from 'utils';
import { OptimalRate } from '@paraswap/sdk';

const BASE_FEE = new Percent(JSBI.BigInt(30), JSBI.BigInt(10000));
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000));
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE);

export function computePriceImpact(rate: OptimalRate): Percent {
  const destUSD = JSBI.BigInt((Number(rate.destUSD) * 10 ** 10).toFixed(0));
  const srcUSD = JSBI.BigInt((Number(rate.srcUSD) * 10 ** 10).toFixed(0));
  const priceChange = JSBI.subtract(srcUSD, destUSD);
  return new Percent(priceChange, srcUSD);
}

// computes price breakdown for the trade
export function computeTradePriceBreakdown(
  trade?: Trade,
): { priceImpactWithoutFee?: Percent; realizedLPFee?: CurrencyAmount } {
  // for each hop in our trade, take away the x*y=k price impact from 0.25% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
        trade.route.pairs.reduce<Fraction>(
          (currentFee: Fraction): Fraction =>
            currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
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
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(
          trade.inputAmount.token,
          realizedLPFee.multiply(trade.inputAmount.raw).quotient,
        )
      : CurrencyAmount.ether(
          realizedLPFee.multiply(trade.inputAmount.raw).quotient,
        ));

  return {
    priceImpactWithoutFee: priceImpactWithoutFeePercent,
    realizedLPFee: realizedLPFeeAmount,
  };
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  trade: Trade | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage);
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  };
}

export function warningSeverity(
  priceImpact: Percent | undefined,
): 0 | 1 | 2 | 3 | 4 {
  if (
    !priceImpact?.lessThan(GlobalValue.percents.BLOCKED_PRICE_IMPACT_NON_EXPERT)
  )
    return 4;
  if (!priceImpact?.lessThan(GlobalValue.percents.ALLOWED_PRICE_IMPACT_HIGH))
    return 3;
  if (!priceImpact?.lessThan(GlobalValue.percents.ALLOWED_PRICE_IMPACT_MEDIUM))
    return 2;
  if (!priceImpact?.lessThan(GlobalValue.percents.ALLOWED_PRICE_IMPACT_LOW))
    return 1;
  return 0;
}

export function formatExecutionPrice(
  trade?: Trade,
  inverted?: boolean,
): string {
  if (!trade) {
    return '';
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${
        trade.inputAmount.currency.symbol
      } / ${trade.outputAmount.currency.symbol}`
    : `${trade.executionPrice.toSignificant(6)} ${
        trade.outputAmount.currency.symbol
      } / ${trade.inputAmount.currency.symbol}`;
}
