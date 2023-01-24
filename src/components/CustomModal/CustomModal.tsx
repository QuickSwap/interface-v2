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
    <Modal
      overlayElement={(props, contentElement) => (
        <div {...props} className='modalOverlay' style={undefined}>
          {contentElement}
        </div>
      )}
      contentElement={(props, children) => (
        <>
          {!hideBackdrop && <div className='modalBackdrop' />}
          <div
            {...props}
            className={modalWrapper ?? 'modalWrapper'}
            style={undefined}
          >
            {children}
          </div>
        </>
      )}
      isOpen={open}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
