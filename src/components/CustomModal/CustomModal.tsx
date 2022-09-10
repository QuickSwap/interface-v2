import React from 'react';
import { Modal, Box, Backdrop, Fade } from '@material-ui/core';
import 'components/styles/CustomModal.scss';

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: any;
  background?: string;
  overflow?: string;
  modalWrapper?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
  modalWrapper,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500, classes: { root: 'customModalBackdrop' } }}
    >
      <Fade in={open}>
        <Box
          className={modalWrapper ? modalWrapper : 'modalWrapperV3'}
          bgcolor={background}
          overflow={overflow}
        >
          {children}
        </Box>
      </Fade>
    </Modal>
  );
};

export default CustomModal;
