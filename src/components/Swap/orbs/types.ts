import { Quote } from '@orbs-network/liquidity-hub-sdk';
import { SwapStatus } from '@orbs-network/swap-ui';
import { OptimalRate } from '@paraswap/sdk';
import { Currency } from '@uniswap/sdk';
import { useLiquidityHubQuote } from './LiquidityHub/hooks';

export enum Steps {
  WRAP = 1,
  APPROVE = 2,
  SWAP = 3,
}

export interface LiquidityHubConfirmationProps {
  inCurrency?: Currency;
  outCurrency?: Currency;
  isOpen: boolean;
  onDismiss: () => void;
  quoteQuery: ReturnType<typeof useLiquidityHubQuote>;
  onSwapFailed?: () => void;
  onSwapSuccess?: () => void;
  optimalRate?: OptimalRate;
  allowedSlippage?: number;
}

export type ConfirmationState = {
  swapStatus?: SwapStatus;
  currentStep?: Steps;
  shouldUnwrap?: boolean;
  txHash?: string;
  steps?: Steps[];
  error?: string;
};

export interface LiquidityHubConfirmationState extends ConfirmationState {
  acceptedQuote?: Quote | null;
  signature?: string;
}
