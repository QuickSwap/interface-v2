import { ChainId } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CustomModal } from 'components';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { ReactComponent as TransactionFailed } from 'assets/images/TransactionFailed.svg';
import { ReactComponent as TransactionSuccess } from 'assets/images/TransactionSuccess.svg';
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';
import ModalBg from 'assets/images/ModalBG.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 20,
    '& h5': {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
    },
    '& svg': {
      cursor: 'pointer',
      position: 'relative',
      zIndex: 3,
    },
  },
  modalBG: {
    position: 'absolute',
    top: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
  },
  modalContent: {
    marginTop: 20,
    padding: '16px 0',
    color: '#c7cad9',
    textAlign: 'center',
    '& p': {
      margin: '16px 0',
    },
  },
  submitButton: {
    width: '100%',
    height: 50,
    fontSize: 14,
    borderRadius: 10,
    color: '#c7cad9',
    background: '#282d3d',
    '&:hover': {
      background: '#282d3d',
    },
  },
}));

interface ConfirmationPendingContentProps {
  onDismiss: () => void;
  pendingText: string;
}

export const ConfirmationPendingContent: React.FC<ConfirmationPendingContentProps> = ({
  onDismiss,
  pendingText,
}) => {
  const classes = useStyles();
  return (
    <Box padding={4}>
      <Box className={classes.modalHeader}>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className={classes.modalContent}>
        <Box my={4} display='flex' justifyContent='center'>
          <CircularProgress size={80} />
        </Box>
        <Typography variant='h5'>Waiting For Confirmation</Typography>
        <Typography variant='body1'>{pendingText}</Typography>
        <Typography variant='caption'>
          Please confirm this transaction in your wallet.
        </Typography>
      </Box>
    </Box>
  );
};

interface TransactionSubmittedContentProps {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
}

export const TransactionSubmittedContent: React.FC<TransactionSubmittedContentProps> = ({
  onDismiss,
  chainId,
  hash,
}) => {
  const classes = useStyles();
  return (
    <Box padding={4}>
      <Box className={classes.modalHeader}>
        <Typography variant='h5'>Transaction Submitted</Typography>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className={classes.modalContent}>
        <Typography variant='body1'>
          Submitted transaction to swap your tokens
        </Typography>
      </Box>
      <Box display='flex' justifyContent='space-between' mt={2}>
        {chainId && hash && (
          <a
            href={getEtherscanLink(chainId, hash, 'transaction')}
            target='_blank'
            rel='noreferrer'
            style={{ width: '48%', textDecoration: 'none' }}
          >
            <Button className={classes.submitButton}>
              View on Block Explorer
            </Button>
          </a>
        )}
        <Button
          className={classes.submitButton}
          style={{ width: '48%' }}
          onClick={onDismiss}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};

interface ConfirmationModalContentProps {
  title: string;
  onDismiss: () => void;
  content: () => React.ReactNode;
}

export const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({
  title,
  onDismiss,
  content,
}) => {
  const classes = useStyles();
  return (
    <Box padding={4}>
      <Box className={classes.modalHeader}>
        <Typography variant='h5'>{title}</Typography>
        <CloseIcon onClick={onDismiss} />
      </Box>
      {content()}
    </Box>
  );
};

interface TransactionErrorContentProps {
  message: string;
  onDismiss: () => void;
}

export const TransactionErrorContent: React.FC<TransactionErrorContentProps> = ({
  message,
  onDismiss,
}) => {
  const classes = useStyles();
  return (
    <Box padding={4}>
      <Box>
        <Box className={classes.modalHeader}>
          <Typography variant='h5' color='error'>
            Error!
          </Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box className={classes.modalContent}>
          <TransactionFailed />
          <Typography variant='body1'>{message}</Typography>
        </Box>
      </Box>
      <Button className={classes.submitButton} onClick={onDismiss}>
        Dismiss
      </Button>
    </Box>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => React.ReactNode;
  attemptingTxn: boolean;
  pendingText: string;
}

const TransactionConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
}) => {
  const { chainId } = useActiveWeb3React();
  const classes = useStyles();

  if (!chainId) return null;

  // confirmation screen
  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
      <img src={ModalBg} alt='Modal Back' className={classes.modalBG} />
      <Box position='relative' zIndex={2}>
        {attemptingTxn ? (
          <ConfirmationPendingContent
            onDismiss={onDismiss}
            pendingText={pendingText}
          />
        ) : hash ? (
          <TransactionSubmittedContent
            chainId={chainId}
            hash={hash}
            onDismiss={onDismiss}
          />
        ) : (
          content()
        )}
      </Box>
    </CustomModal>
  );
};

export default TransactionConfirmationModal;
