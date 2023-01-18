import React from 'react';
import { Box } from 'theme/components';
import Modal from 'react-modal';
import 'components/styles/CustomModal.scss';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: any;
  background?: string;
  overflow?: string;
  modalWrapper?: string;
  hideBackdrop?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
  modalWrapper,
  hideBackdrop,
}) => {
  return (
    <Modal isOpen={open} onRequestClose={onClose}>
      <Box
        className={modalWrapper ? modalWrapper : 'modalWrapperV3'}
        overflow={overflow}
      >
        {children}
      </Box>
    </Modal>
  );
};

export default CustomModal;
