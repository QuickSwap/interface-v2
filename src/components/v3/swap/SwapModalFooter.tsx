import React, { ReactNode } from 'react';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { Trade as V3Trade } from 'lib/src/trade';
import SwapCallbackError from './SwapCallbackError';
import { useTranslation } from 'react-i18next';
import { Box, Button } from 'theme/components';

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
    <Box margin='16px 0 0' className='swapButtonWrapper'>
      <Button onClick={onConfirm} disabled={disabledConfirm} width='100%'>
        {t('confirmSwap')}
      </Button>
      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </Box>
  );
}
