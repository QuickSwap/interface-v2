import { ChainId } from '@uniswap/sdk';
import React, { useMemo } from 'react';
import { Box, Button } from '@material-ui/core';
import { CustomModal } from 'components';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import TransactionFailed from 'assets/images/TransactionFailed.png';
import TransactionSubmitted from 'assets/images/TransactionSubmitted.png';
import { getEtherscanLink } from 'utils';
import { useActiveWeb3React } from 'hooks';
import ModalBg from 'assets/images/ModalBG.svg';
import SpinnerImage from '../../assets/images/spinner.svg';
import 'components/styles/TransactionConfirmationModal.scss';
import { useTranslation } from 'react-i18next';
import { CheckCircleOutline } from '@material-ui/icons';
import {
  LiquidityHubConfirmationModalContent,
  useConfirmationPendingContent,
} from 'components/Swap/LiquidityHub';
import { useLiquidityHubState } from 'state/swap/liquidity-hub/hooks';

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
      <Box className='txModalHeader'>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box className='txModalContent'>
        <Box my={4} className='flex justify-center spinner'>
          <img src={SpinnerImage} alt='Spinner' />
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
      <Box className='txModalHeader'>
        <h5>{txPending ? t('txSubmitted') : t('txCompleted')}</h5>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box mt={8} className='flex justify-center'>
        <img src={TransactionSubmitted} alt='Transaction Submitted' />
      </Box>
      <Box className='txModalContent txModalContentSuccess'>
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
            <Button className='txSubmitButton'>{t('viewTx')}</Button>
          </a>
        )}
        <Button
          className='txSubmitButton'
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
      <Box className='txModalHeader'>
        <h5>{title}</h5>
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
  const { t } = useTranslation();
  return (
    <Box padding={4}>
      <Box>
        <Box className='txModalHeader'>
          <h5 className='text-error'>Error!</h5>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box className='txModalContent flex items-center flex-col'>
          <img src={TransactionFailed} alt='Transaction Failed' />
          <p>{message}</p>
        </Box>
      </Box>
      <Button className='txSubmitButton' onClick={onDismiss}>
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
      modalWrapper={`${modalWrapper}${isTxWrapper ? ' txModalWrapper' : ''}`}
    >
      <img src={ModalBg} alt='Modal Back' className='txModalBG' />
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
