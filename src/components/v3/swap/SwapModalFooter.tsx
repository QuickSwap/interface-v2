import React, { ReactNode } from 'react';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/trade';
import SwapCallbackError from './SwapCallbackError';
import { useTranslation } from 'next-i18next';
import { Box, Button } from '@mui/material';
import styles from 'styles/pages/Swap.module.scss';

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade: V3Trade<Currency, Currency, TradeType>;
  onConfirm: () => void;
  swapErrorMessage: ReactNode | undefined;
  disabledConfirm: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Box mt={2} className={styles.swapButtonWrapper}>
      <Button onClick={onConfirm} disabled={disabledConfirm} fullWidth>
        {t('confirmSwap')}
      </Button>
      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </Box>
  );
}
