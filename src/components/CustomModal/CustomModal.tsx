import React from 'react';
import { Modal, Box, Backdrop, Fade } from '@mui/material';
import styles from 'styles/components/CustomModal.module.scss';

interface CustomModalProps {
  open: boolean;
  onClose?: () => void;
  children: any;
  background?: string;
  overflow?: string;
  hideBackdrop?: boolean;
  modalWrapper?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
  background,
  overflow,
  hideBackdrop,
  modalWrapper,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      slots={{ backdrop: hideBackdrop ? undefined : Backdrop }}
      slotProps={{
        backdrop: hideBackdrop
          ? undefined
          : { timeout: 500, classes: { root: styles.customModalBackdrop } },
      }}
    >
      <Fade in={open}>
        <Box
          className={`${styles.modalWrapperV3} ${modalWrapper}`}
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
