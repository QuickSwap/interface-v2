import { ChainId } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import cx from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { CustomModal } from 'components';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { ReactComponent as  CloseIcon } from 'assets/images/x.svg'
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  confirmModalTop: {
    padding: 16,
  },
  confirmModalBottom: {
    padding: 16,
    background: '#EEE'
  },
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
    justifyContent: 'space-between',
    marginBottom: 20,
    color: 'black',
    '& p': {
      fontSize: 20,
    },
    '& svg': {
      cursor: 'pointer'
    }
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
        <Typography />
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
        <Typography />
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
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}

export const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({
  title,
  bottomContent,
  onDismiss,
  topContent
}) => {
  const classes = useStyles();
  return (
    <Box>
      <Box className={classes.confirmModalTop}>
        <Box className={classes.modalHeader}>
          <Typography>{title}</Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
        {topContent()}
      </Box>
      <Box className={classes.confirmModalBottom}>{bottomContent()}</Box>
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
          <Typography>Error</Typography>
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
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent chainId={chainId} hash={hash} onDismiss={onDismiss} />
      ) : (
        content()
      )}
    </CustomModal>
  )
}

export default TransactionConfirmationModal;
