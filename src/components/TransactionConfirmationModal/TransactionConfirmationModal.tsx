import { ChainId } from '@uniswap/sdk';
import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@material-ui/core';
import { CustomModal } from 'components';
import { AlertTriangle, ArrowUpCircle } from 'react-feather';
import { ReactComponent as  CloseIcon } from 'assets/images/x.svg'
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: string }) {
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

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
}) {
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

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Box>
      <Box>
        <Box>
          <Typography>
            {title}
          </Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
        {topContent()}
      </Box>
      <Box>{bottomContent()}</Box>
    </Box>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <Box>
      <Box>
        <Box>
          <Typography>
            Error
          </Typography>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box style={{ marginTop: 20, padding: '2rem 0' }}>
          <AlertTriangle style={{ strokeWidth: 1.5 }} size={64} />
          <Typography>
            {message}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Button onClick={onDismiss}>Dismiss</Button>
      </Box>
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

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content
}: ConfirmationModalProps) {
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
