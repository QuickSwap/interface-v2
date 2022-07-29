import { currencyEquals, Trade } from '@uniswap/sdk';
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Trade as V3Trade } from 'lib/src/trade'
import { Trade as V2Trade } from '@uniswap/v2-sdk'
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
  trade: Trade | V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined;
  originalTrade: Trade| V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
  attemptingTxn: boolean;
  txPending?: boolean;
  txHash: string | undefined;
  recipient: string | null;
  allowedSlippage: number | Percent;
  onAcceptChanges: () => void;
  onConfirm: () => void;
  swapErrorMessage: string | undefined;
  onDismiss: () => void;
}

const ConfirmSwapModal: React.FC<ConfirmSwapModalProps> = ({
  trade,
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
        trade &&
          originalTrade &&
          tradeMeaningfullyDiffers(trade, originalTrade),
      ),
    [originalTrade, trade],
  );

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowedSlippage={allowedSlippage}
        onConfirm={onConfirm}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null;
  }, [allowedSlippage, onAcceptChanges, showAcceptChanges, trade, onConfirm]);

  // text to show while loading
  const pendingText = t('swappingFor', {
    amount1: formatTokenAmount(trade?.inputAmount),
    symbol1: trade?.inputAmount?.currency?.symbol,
    amount2: formatTokenAmount(trade?.outputAmount),
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
