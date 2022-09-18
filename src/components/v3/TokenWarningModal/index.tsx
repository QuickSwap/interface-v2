import React from 'react';
import { Token } from '@uniswap/sdk-core';
import { CustomModal } from 'components';

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
  onDismiss,
}: {
  isOpen: boolean;
  tokens: Token[];
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
      {/* TODO: Allow importinf for v3 Swap <ImportToken tokens={tokens} handleCurrencySelect={onConfirm} /> */}
    </CustomModal>
  );
}
