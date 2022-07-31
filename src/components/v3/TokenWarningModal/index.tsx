import { Token } from '@uniswap/sdk-core';
import Modal from 'components/Modal';

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
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      {/* TODO: Allow importinf for v3 Swap <ImportToken tokens={tokens} handleCurrencySelect={onConfirm} /> */}
    </Modal>
  );
}
