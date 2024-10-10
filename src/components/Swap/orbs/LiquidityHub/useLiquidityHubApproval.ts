import { permit2Address } from '@orbs-network/liquidity-hub-sdk';
import { useApproval } from '../hooks';
import { useLiquidityHubConfirmationContext } from './LiquidityHubSwapConfirmation/context';

export const useLiquidityHubApproval = () => {
  const { inCurrency, inAmount } = useLiquidityHubConfirmationContext();
  return useApproval(
    permit2Address,
    inCurrency,
    inAmount?.numerator.toString(),
  );
};
