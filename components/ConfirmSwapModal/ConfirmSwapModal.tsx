import { Currency, currencyEquals, Trade } from '@uniswap/sdk';
import React, { useCallback, useMemo } from 'react';
import {
  TransactionConfirmationModal,
  TransactionErrorContent,
  ConfirmationModalContent,
} from 'components';
import SwapModalHeader from './SwapModalHeader';
import { formatTokenAmount } from 'utils';
import 'components/styles/ConfirmSwapModal.scss';
import { useTranslation } from 'react-i18next';
import { OptimalRate } from '@paraswap/sdk';

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: Trade, tradeB: Trade): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !currencyEquals(
      tradeA.outputAmount.currency,
      tradeB.outputAmount.currency,
    ) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  );
}

interface ConfirmSwapModalProps {
  isOpen: boolean;
  optimalRate?: OptimalRate;
  trade?: Trade;
  originalTrade?: Trade;
  inputCurrency?: Currency;
  outputCurrency?: Currency;
  attemptingTxn: boolean;
  txPending?: boolean;
  txHash: string | undefined;
  recipient: string | null;
  allowedSlippage: number;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onDismiss: () => void;
}

const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  trade,
  optimalRate,
  inputCurrency,
  outputCurrency,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  txPending,
}) => {
  const { t } = useTranslation();
  const showAcceptChanges = useMemo(
    () =>
      Boolean(
        !optimalRate &&
          trade &&
          originalTrade &&
          tradeMeaningfullyDiffers(trade, originalTrade),
      ),
    [originalTrade, trade, optimalRate],
  );

  const modalHeader = useCallback(() => {
    return optimalRate ?? trade ? (
      <SwapModalHeader
        trade={trade}
        optimalRate={optimalRate}
        inputCurrency={inputCurrency}
        outputCurrency={outputCurrency}
        allowedSlippage={allowedSlippage}
        onConfirm={onConfirm}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [
    allowedSlippage,
    onAcceptChanges,
    optimalRate,
    showAcceptChanges,
    trade,
    onConfirm,
    inputCurrency,
    outputCurrency,
  ]);

  // text to show while loading
  const pendingText = t('swappingFor', {
    amount1: optimalRate
      ? Number(optimalRate.srcAmount) / 10 ** optimalRate.srcDecimals
      : formatTokenAmount(trade?.inputAmount),
    symbol1: trade
      ? trade?.inputAmount?.currency?.symbol
      : inputCurrency?.symbol,
    amount2: optimalRate
      ? Number(optimalRate.destAmount) / 10 ** optimalRate.destDecimals
      : formatTokenAmount(trade?.outputAmount),
    symbol2: trade
      ? trade?.outputAmount?.currency?.symbol
      : outputCurrency?.symbol,
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
          title={t('confirmTx')}
          onDismiss={onDismiss}
          content={modalHeader}
        />
      ),
    [t, onDismiss, modalHeader, swapErrorMessage],
  );

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      txPending={txPending}
      content={confirmationContent}
      pendingText={pendingText}
      modalContent={txPending ? t('submittedTxSwap') : t('swapSuccess')}
    />
  );
};

export default ConfirmSwapModal;
