import CustomModal from 'components/CustomModal';
import React from 'react';
import { useTwapOrdersContext } from './context';

export const TwapOrdersModal = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isOpen, onDismiss } = useTwapOrdersContext();
  return (
    <CustomModal
      open={isOpen}
      onClose={onDismiss}
      modalWrapper={'TwapOrdersModalWrapper'}
      hideBackdrop={true}
    >
      {children}
    </CustomModal>
  );
};
