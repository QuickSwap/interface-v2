import { ChainId } from '@uniswap/sdk';
import React from 'react';
import { Box, Button } from '@mui/material';
import { CustomModal } from 'components';
import { Close, CheckCircleOutline } from '@mui/icons-material';
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';
import styles from 'styles/components/TransactionConfirmationModal.module.scss';
import { useTranslation } from 'next-i18next';
import {
  LiquidityHubConfirmationModalContent,
  useConfirmationPendingContent,
} from 'components/Swap/LiquidityHub';
import Spinner from 'svgs/spinner.svg';
import ModalBG from 'svgs/ModalBG.svg';
import Image from 'next/image';

interface ConfirmationPendingContentProps {
  onDismiss: () => void;
  pendingText?: string;
}

export const ConfirmationPendingContent: React.FC<ConfirmationPendingContentProps> = ({
  onDismiss,
  pendingText,
}) => {
  const confirmationPendingContent = useConfirmationPendingContent(pendingText);

  return (
    <Box padding={4} overflow='hidden'>
      <Box className={styles.txModalHeader}>
        <Close onClick={onDismiss} />
      </Box>
      <Box className={styles.txModalContent}>
        <Box my={4} className='flex justify-center spinner'>
          <Spinner />
        </Box>
        <h5>{confirmationPendingContent.title}</h5>
        {confirmationPendingContent.pending && (
          <p>{confirmationPendingContent.pending}</p>
        )}
        <p>{confirmationPendingContent.confirm || ''}</p>
      </Box>
    </Box>
  );
};

interface TransactionSubmittedContentProps {
  onDismiss: () => void;
  hash: string | undefined;
  chainId: ChainId;
  txPending?: boolean;
  modalContent: string;
}

export const TransactionSubmittedContent: React.FC<TransactionSubmittedContentProps> = ({
  onDismiss,
  chainId,
  hash,
  txPending,
  modalContent,
}) => {
  const { t } = useTranslation();
  return (
    <Box padding={4}>
      <Box className={styles.txModalHeader}>
        <h5>{txPending ? t('txSubmitted') : t('txCompleted')}</h5>
        <Close onClick={onDismiss} />
      </Box>
      <Box mt={8} className='flex justify-center'>
        <Image
          src='/assets/images/TransactionSubmitted.png'
          alt='Transaction Submitted'
          width={179}
          height={126}
        />
      </Box>
      <Box
        className={`${styles.txModalContent} ${styles.txModalContentSuccess}`}
      >
        <p>
          {!txPending && <CheckCircleOutline />}
          {modalContent}
          <LiquidityHubConfirmationModalContent txPending={txPending} />
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
            <Button className={styles.txSubmitButton}>{t('viewTx')}</Button>
          </a>
        )}
        <Button
          className={styles.txSubmitButton}
          style={{ width: '48%' }}
          onClick={onDismiss}
        >
          {t('close')}
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
  return (
    <Box padding={4}>
      <Box className={styles.txModalHeader}>
        <h5>{title}</h5>
        <Close onClick={onDismiss} />
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
  const { t } = useTranslation();
  return (
    <Box padding={4}>
      <Box>
        <Box className={styles.txModalHeader}>
          <h5 className='text-error'>Error!</h5>
          <Close onClick={onDismiss} />
        </Box>
        <Box className={styles.txModalContent}>
          <Image
            src='/assets/images/TransactionFailed.png'
            alt='Transaction Failed'
            width={92}
            height={147}
          />
          <p>{message}</p>
        </Box>
      </Box>
      <Button className={styles.txSubmitButton} onClick={onDismiss}>
        {t('close')}
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
  pendingText?: string;
  modalContent: string;
  txPending?: boolean;
  modalWrapper?: string;
  isTxWrapper?: boolean;
}

const TransactionConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onDismiss,
  attemptingTxn,
  txPending,
  hash,
  pendingText,
  content,
  modalContent,
  modalWrapper,
  isTxWrapper = true,
}) => {
  const { chainId } = useActiveWeb3React();

  if (!chainId) return null;

  // confirmation screen
  return (
    <CustomModal
      open={isOpen}
      onClose={onDismiss}
      modalWrapper={`${modalWrapper} ${
        isTxWrapper ? styles.txModalWrapper : ''
      }`}
    >
      <ModalBG className={styles.txModalBG} />
      <Box position='relative' zIndex={2}>
        {attemptingTxn ? (
          <ConfirmationPendingContent
            onDismiss={onDismiss}
            pendingText={pendingText}
          />
        ) : hash ? (
          <TransactionSubmittedContent
            chainId={chainId}
            txPending={txPending}
            hash={hash}
            onDismiss={onDismiss}
            modalContent={modalContent}
          />
        ) : (
          content()
        )}
      </Box>
    </CustomModal>
  );
};

export default TransactionConfirmationModal;
