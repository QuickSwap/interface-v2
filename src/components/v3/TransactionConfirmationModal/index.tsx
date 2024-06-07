import React, { ReactNode } from 'react';
import { Box, Button } from '@material-ui/core';
import { X } from 'react-feather';
import SpinnerImage from 'assets/images/spinner.svg';
import { useActiveWeb3React } from 'hooks';
import { CustomModal } from 'components';
import { getEtherscanLink } from 'utils';
import { useTranslation } from 'react-i18next';
import TransactionFailed from 'assets/images/TransactionFailed.png';
import TransactionSubmitted from 'assets/images/TransactionSubmitted.png';
import 'components/styles/TransactionConfirmationModal.scss';
import { CheckCircleOutline } from '@material-ui/icons';

interface ConfirmationPendingContentProps {
  onDismiss: () => void;
  pendingText: ReactNode;
  inline?: boolean; // not in modal
}

function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: ConfirmationPendingContentProps) {
  const { t } = useTranslation();
  return (
    <Box className='flex flex-col items-center'>
      {!inline && (
        <Box width='100%' className='flex justify-between'>
          <Box />
          <X className='cursor-pointer' onClick={onDismiss} />
        </Box>
      )}
      <Box className='flex justify-center spinner'>
        <img src={SpinnerImage} alt='Spinner' />
      </Box>
      <Box mt='20px' textAlign='center'>
        <p>{t('waitingConfirm')}</p>
        <Box my='8px'>
          <small>{pendingText}</small>
        </Box>
        <p className='small text-secondary'>{t('confirmTxinWallet')}</p>
      </Box>
    </Box>
  );
}

interface TransactionSubmittedContentProps {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: number;
  inline?: boolean; // not in modal
  txPending?: boolean;
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  inline,
  txPending,
}: TransactionSubmittedContentProps) {
  const { t } = useTranslation();

  return (
    <div>
      {!inline && (
        <Box className='txModalHeader'>
          <h5>{txPending ? t('txSubmitted') : t('txCompleted')}</h5>
          <X className='cursor-pointer' onClick={onDismiss} />
        </Box>
      )}
      <Box mt={8} className='flex justify-center'>
        <img src={TransactionSubmitted} alt='Transaction Submitted' />
      </Box>
      <Box className='txModalContent txModalContentSuccess'>
        <p>
          {!txPending && <CheckCircleOutline />}
          {txPending ? t('submittedTxSwap') : t('swapSuccess')}
        </p>
      </Box>
      <Box className='flex justify-between' mt={2}>
        {chainId && hash && (
          <a
            href={getEtherscanLink(chainId, hash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
            style={{ width: '48%', textDecoration: 'none' }}
          >
            <Button className='txSubmitButton'>{t('viewTx')}</Button>
          </a>
        )}
        <Button
          onClick={onDismiss}
          className='txSubmitButton'
          style={{ width: '48%' }}
        >
          {t('close')}
        </Button>
      </Box>
    </div>
  );
}

interface ConfirmationModalContentProps {
  title: ReactNode;
  onDismiss: () => void;
  topContent: () => ReactNode;
  bottomContent?: () => ReactNode | undefined;
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
}: ConfirmationModalContentProps) {
  return (
    <Box width='100%'>
      <Box className='flex items-center justify-between' mb={2}>
        {title}
        <X className='cursor-pointer' onClick={onDismiss} />
      </Box>
      {topContent()}
      {bottomContent && <>{bottomContent()}</>}
    </Box>
  );
}

interface TransactionErrorContentProps {
  message: ReactNode;
  onDismiss: () => void;
}

export function TransactionErrorContent({
  message,
  onDismiss,
}: TransactionErrorContentProps) {
  const { t } = useTranslation();
  return (
    <Box>
      <Box className='txModalHeader'>
        <h5 className='text-error'>{t('error')}</h5>
        <X className='cursor-pointer' onClick={onDismiss} />
      </Box>
      <Box mt={2} className='txModalContent flex items-center flex-col'>
        <img src={TransactionFailed} alt='Transaction Failed' />
        <p>{message}</p>
      </Box>
      <Box mt={2}>
        <Button fullWidth onClick={onDismiss} className='txSubmitButton'>
          {t('close')}
        </Button>
      </Box>
    </Box>
  );
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  hash: string | undefined;
  content: () => ReactNode;
  attemptingTxn: boolean;
  pendingText: ReactNode;
  txPending?: boolean;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  txPending,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  // if on L2 and submitted dont render content, as should auto dismiss
  // need this to skip submitted view during state update ^^
  return (
    <CustomModal
      modalWrapper='txModalWrapper'
      open={isOpen}
      onClose={onDismiss}
    >
      <Box padding='24px 20px 20px'>
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
            txPending={txPending}
          />
        ) : (
          content()
        )}
      </Box>
    </CustomModal>
  );
}
