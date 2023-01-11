import React, { ReactNode } from 'react';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { Trade as V3Trade } from 'lib/src/trade';
import SwapCallbackError from './SwapCallbackError';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: {
  trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>;
  onConfirm: () => void;
  swapErrorMessage: ReactNode | undefined;
  disabledConfirm: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Box mt={2} className='swapButtonWrapper'>
      <Button onClick={onConfirm} disabled={disabledConfirm} fullWidth>
        {t('confirmSwap')}
      </Button>
      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </Box>
  );
}
