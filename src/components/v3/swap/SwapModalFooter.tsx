import React, { ReactNode } from 'react';
import { Currency, TradeType } from '@uniswap/sdk-core';
import { Trade as V2Trade } from '@uniswap/v2-sdk';
import { Trade as V3Trade } from 'lib/src/trade';
import { SwapCallbackError } from './styled';
import { StyledButton } from '../Common/styledElements';

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
  return (
    <div className={'flex-s-between mt-1'}>
      <StyledButton
        onClick={onConfirm}
        disabled={disabledConfirm}
        id='confirm-swap-or-send'
        className={' w-100 p-1 mt-1'}
      >
        {'Confirm Swap'}
      </StyledButton>
      {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
    </div>
  );
}
