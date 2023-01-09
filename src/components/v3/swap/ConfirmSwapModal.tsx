import React, { ReactNode, useCallback, useMemo } from 'react';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/v3/TransactionConfirmationModal';
import { Trade as V3Trade } from 'lib/src/trade';
import SwapModalFooter from './SwapModalFooter';
import SwapModalHeader from './SwapModalHeader';
import { useTranslation } from 'react-i18next';

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param args either a pair of V2 trades or a pair of V3 trades
 */
function tradeMeaningfullyDiffers(
  ...args:
    | [
        V2Trade<Currency, Currency, TradeType>,
        V2Trade<Currency, Currency, TradeType>,
      ]
    | [
        V3Trade<Currency, Currency, TradeType>,
        V3Trade<Currency, Currency, TradeType>,
      ]
): boolean {
  const [tradeA, tradeB] = args;
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}

interface ConfirmSwapModalProps {
  isOpen: boolean;
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | undefined;
  originalTrade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | undefined;
  attemptingTxn: boolean;
  txHash: string | undefined;
  recipient: string | null;
  allowedSlippage: Percent;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: ReactNode | undefined;
  onDismiss: () => void;
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
}: ConfirmSwapModalProps) {
  const { t } = useTranslation();
  const showAcceptChanges = useMemo(
    () =>
      Boolean(
        (trade instanceof V2Trade &&
          originalTrade instanceof V2Trade &&
          tradeMeaningfullyDiffers(trade, originalTrade)) ||
          (trade instanceof V3Trade &&
            originalTrade instanceof V3Trade &&
            tradeMeaningfullyDiffers(trade, originalTrade)),
      ),
    [originalTrade, trade],
  );

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade]);

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter
        onConfirm={onConfirm}
        trade={trade}
        disabledConfirm={showAcceptChanges}
        swapErrorMessage={swapErrorMessage}
      />
    ) : null;
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade]);

  // text to show while loading
  const pendingText = t('swappingFor', {
    amount1: trade?.inputAmount?.toSignificant(6),
    symbol1: trade?.inputAmount?.currency?.symbol,
    amount2: trade?.outputAmount?.toSignificant(6),
    symbol2: trade?.outputAmount?.currency?.symbol,
  });

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent
          onDismiss={onDismiss}
          message={swapErrorMessage}
        />
      ) : (
        <ConfirmationModalContent
          title={t('confirmSwap')}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage, t],
  );

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={pendingText}
      currencyToAdd={trade?.outputAmount.currency}
    />
  );
}
