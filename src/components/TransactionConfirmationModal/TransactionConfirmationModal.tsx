import { ChainId } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import cx from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { CustomModal } from 'components';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { ReactComponent as  CloseIcon } from 'assets/images/CloseIcon.svg'
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';
import ModalBg from 'assets/images/ModalBG.svg';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  transactionContent: {
    padding: 16,
    '& $modalContent': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: 'black',
      '& svg': {
        strokeWidth: 1.5,
        marginBottom: 16
      }
    }
  },
  transactionError: {
    '& $modalContent': {
      color: palette.error.main,
    }
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    marginBottom: 20,
    '& h5': {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
    },
    '& svg': {
      cursor: 'pointer'
    }
  },
  modalBG: {
    position: 'absolute',
    top: 100,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1
  },
  modalContent: {
    marginTop: 20,
    padding: '16px 0',
    '& h1': {
      fontSize: 24,
      margin: '32px 0 8px'
    },
    '& h2': {
      fontSize: 20,
    },
    '& p': {
      fontSize: 16,
      color: '#666',
      margin: '8px 0 0'
    },
    '& a': {
      fontSize: 16
    }
  },
  submitButton: {
    width: '100%',
    height: 48,
    fontSize: 20,
    borderRadius: 16
  }
}));

interface ConfirmationPendingContentProps {
  onDismiss: () => void;
  pendingText: string;
}

export const ConfirmationPendingContent: React.FC<ConfirmationPendingContentProps> =({ onDismiss, pendingText }) => {
  const classes = useStyles();
  return (
    <Box className={classes.transactionContent}>
      <Box className={classes.modalHeader}>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className={classes.modalContent}>
        <CircularProgress size={64} />
        <Typography component='h1'>
          Waiting For Confirmation
        </Typography>
        <Typography component='h2'>
          {pendingText}
        </Typography>
        <Typography>
          Confirm this transaction in your wallet
        </Typography>
      </Box>
    </Box>
  )
}

interface TransactionSubmittedContentProps {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
}

export const TransactionSubmittedContent: React.FC<TransactionSubmittedContentProps> = ({
  onDismiss,
  chainId,
  hash
}) => {
  const classes = useStyles();
  return (
    <Box className={classes.transactionContent}>
      <Box className={classes.modalHeader}>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className={classes.modalContent}>
        <ArrowUpCircle strokeWidth={0.5} size={90} />
        <Typography component='h1'>
          Transaction Submitted
        </Typography>
        {chainId && hash && (
          <a href={getEtherscanLink(chainId, hash, 'transaction')} target='_blank' rel='noreferrer'>
            View on Block Explorer
          </a>
        )}
        <Button className={classes.submitButton} onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
          Close
        </Button>
      </Box>
    </Box>
  )
}

interface ConfirmationModalContentProps {
  title: string
  onDismiss: () => void
  content: () => React.ReactNode
}

export const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({
  title,
  onDismiss,
  content
}) => {
  const classes = useStyles();
  return (
    <Box padding={4}>
      <Box className={classes.modalHeader}>
        <Typography variant='h5'>{title}</Typography>
        <CloseIcon onClick={onDismiss} />
      </Box>
      { content() }
    </Box>
  )
}

interface TransactionErrorContentProps {
  message: string;
  onDismiss: () => void;
}

export const TransactionErrorContent: React.FC<TransactionErrorContentProps> = ({ message, onDismiss }) => {
  const classes = useStyles();
  return (
    <Box className={cx(classes.transactionContent, classes.transactionError)}>
      <Box>
        <Box className={classes.modalHeader}>
          <Typography variant='h5'>Error</Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box className={classes.modalContent}>
          <AlertTriangle size={64} />
          <Typography>
            {message}
          </Typography>
        </Box>
      </Box>
      <Button className={classes.submitButton} onClick={onDismiss}>Dismiss</Button>
    </Box>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
}

const TransactionConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content
}) => {
  const { chainId } = useActiveWeb3React();
  const classes = useStyles();

  if (!chainId) return null

  // confirmation screen
  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
      <img src={ModalBg} alt='Modal Back' className={classes.modalBG} />
      <Box position='relative' zIndex={2}>
        {attemptingTxn ? (
          <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
        ) : hash ? (
          <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
        ) : (
          content()
        )}
      </Box>
    </CustomModal>
  )
}

export default TransactionConfirmationModal;
