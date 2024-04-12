import { Trade } from '@uniswap/sdk';
import { useMemo } from 'react';
import { computeTradePriceBreakdown } from 'utils/prices';
import useUSDCPrice from 'utils/useUSDCPrice';
import { formatTokenAmount } from 'utils';

const DEFAULT_AUTO_SLIPPAGE = 0.5; // 0.5%
const MIN_AUTO_SLIPPAGE_TOLERANCE = DEFAULT_AUTO_SLIPPAGE;
// assuming normal gas speeds, most swaps complete within 3 blocks and
// there's rarely price movement >5% in that time period
const MAX_AUTO_SLIPPAGE_TOLERANCE = 5; // 5%

export default function useAutoSlippageTolerance(
  trade?: Trade | undefined,
): any {
  const usdPrice = Number(
    useUSDCPrice(trade?.outputAmount.currency)?.toSignificant() ?? 0,
  );
  const amount = trade?.outputAmount.toExact();

  const amountOutValueDollar = usdPrice * Number(amount);

  const { realizedLPFee } = computeTradePriceBreakdown(trade);
  const usdInputPrice = Number(
    useUSDCPrice(trade?.inputAmount.currency)?.toSignificant() ?? 0,
  );
  const transactionFeeDollar =
    usdInputPrice * Number(formatTokenAmount(realizedLPFee));

  return useMemo(() => {
    const recommendedSlippage =
      (transactionFeeDollar / amountOutValueDollar) * 100;

    if (
      recommendedSlippage >= MIN_AUTO_SLIPPAGE_TOLERANCE &&
      recommendedSlippage <= MAX_AUTO_SLIPPAGE_TOLERANCE
    ) {
      return (recommendedSlippage * 100).toFixed(0);
    } else if (recommendedSlippage < MIN_AUTO_SLIPPAGE_TOLERANCE) {
      return DEFAULT_AUTO_SLIPPAGE;
    } else if (recommendedSlippage > MAX_AUTO_SLIPPAGE_TOLERANCE) {
      return MAX_AUTO_SLIPPAGE_TOLERANCE;
    }
  }, [amountOutValueDollar, transactionFeeDollar]);
}
