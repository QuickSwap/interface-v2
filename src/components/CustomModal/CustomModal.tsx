import React from 'react';
import { Modal, Box, Backdrop, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(({ palette }) => ({
  wrapper: {
    margin: 0,
    padding: 0,
    maxWidth: 500,
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: 20,
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    background: '#1b1e29',
  },
}));

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  children: any;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  children,
}) => {
  const classes = useStyles();
  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box className={classes.wrapper}>{children}</Box>
      </Fade>
    </Modal>
  );
};

export default CustomModal;
