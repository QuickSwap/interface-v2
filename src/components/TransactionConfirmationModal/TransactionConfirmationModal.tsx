import { ChainId } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import { CustomModal } from 'components';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { ReactComponent as  CloseIcon } from 'assets/images/x.svg'
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  confirmModalTop: {
    color: 'black',
    padding: 16,
    '& > .header': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      '& p': {
        fontSize: 20,
      },
      '& svg': {
        cursor: 'pointer'
      }
    }
  },
  confirmModalBottom: {
    padding: 16,
    background: '#EEE'
  }
}));

interface ConfirmationPendingContentProps {
  onDismiss: () => void;
  pendingText: string;
}

export const ConfirmationPendingContent: React.FC<ConfirmationPendingContentProps> =({ onDismiss, pendingText }) => {
  return (
    <Box>
      <Box>
        <Box>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <CircularProgress size={32} />
        <Box>
          <Typography>
            Waiting For Confirmation
          </Typography>
          <Box>
            <Typography>
              {pendingText}
            </Typography>
          </Box>
          <Typography>
            Confirm this transaction in your wallet
          </Typography>
        </Box>
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
  return (
    <Box>
      <Box>
        <Box>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <ArrowUpCircle strokeWidth={0.5} size={90} />
        <Box>
          <Typography>
            Transaction Submitted
          </Typography>
          {chainId && hash && (
            <a href={getEtherscanLink(chainId, hash, 'transaction')} target='_blank' rel='noreferrer'>
              View on Block Explorer
            </a>
          )}
          <Button onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
            Close
          </Button>
        </Box>
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
        <Box className='header'>
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
  return (
    <Box>
      <Box>
        <Box>
          <Typography>Error</Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box style={{ marginTop: 20, padding: '2rem 0' }}>
          <AlertTriangle style={{ strokeWidth: 1.5 }} size={64} />
          <Typography>
            {message}
          </Typography>
        </Box>
      </Box>
      <Button onClick={onDismiss}>Dismiss</Button>
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
