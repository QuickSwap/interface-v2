import { Currency } from '@uniswap/sdk-core';
import React, { ReactNode, useEffect } from 'react';
import { Box, Button } from '@material-ui/core';
import {
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle,
  ExternalLink,
  X,
} from 'react-feather';
import Circle from 'assets/images/blue-loader.svg';
import MetaMaskLogo from 'assets/images/metamask-logo.svg';
import { useActiveWeb3React } from 'hooks';
import useAddTokenToMetamask from 'hooks/v3/useAddTokenToMetamask';
import { CustomModal } from 'components';
import { CloseIcon, CustomLightSpinner } from 'theme/components';
import { ExplorerDataType, getEtherscanLink } from 'utils';
import { useTranslation } from 'react-i18next';

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
          <X onClick={onDismiss} />
        </Box>
      )}
      <CustomLightSpinner
        src={Circle}
        alt='loader'
        size={inline ? '40px' : '90px'}
      />
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
  currencyToAdd?: Currency | undefined;
  inline?: boolean; // not in modal
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd,
  inline,
}: TransactionSubmittedContentProps) {
  const { t } = useTranslation();

  const { library } = useActiveWeb3React();

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd);

  return (
    <div>
      {!inline && (
        <Box className='flex justify-between'>
          <div />
          <CloseIcon onClick={onDismiss} />
        </Box>
      )}
      <Box mt={2} className='flex justify-center'>
        <ArrowUpCircle strokeWidth={0.5} size={inline ? '40px' : '90px'} />
      </Box>
      <Box mt={2} className='flex flex-col items-center'>
        <h5>{t('txSubmitted')}</h5>
        {chainId && hash && (
          <ExternalLink
            href={getEtherscanLink(chainId, hash, ExplorerDataType.TRANSACTION)}
          >
            <small>{t('viewonBlockExplorer')}</small>
          </ExternalLink>
        )}
        {currencyToAdd && library?.provider?.isMetaMask && (
          <>
            {!success ? (
              <Button
                style={{ marginTop: 12, borderRadius: 12 }}
                onClick={addToken}
              >
                <Box className='flex items-center'>
                  {t('addToMetamaskToken', { symbol: currencyToAdd.symbol })}
                  <img
                    src={MetaMaskLogo}
                    alt='Metamask'
                    width='16px'
                    style={{ marginLeft: 6 }}
                  />
                </Box>
              </Button>
            ) : (
              <Box mt='12px' className='flex items-center'>
                <p>
                  {t('added')} {currencyToAdd.symbol}
                </p>
                <CheckCircle
                  size={'16px'}
                  stroke='green'
                  style={{ marginLeft: '6px' }}
                />
              </Box>
            )}
          </>
        )}
        <Button
          fullWidth
          onClick={onDismiss}
          style={{
            height: 40,
            borderRadius: 12,
            margin: '20px 0 0 0',
            color: 'white',
          }}
        >
          {inline ? t('return') : t('close')}
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
        <CloseIcon onClick={onDismiss} />
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
      <Box>
        <Box className='flex justify-between'>
          <h5>{t('error')}</h5>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box mt={2} className='flex flex-col items-center'>
          <AlertTriangle color='red' style={{ strokeWidth: 1.5 }} size={64} />
          <p
            className='text-error'
            style={{
              marginTop: 16,
              textAlign: 'center',
              width: '85%',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </p>
        </Box>
      </Box>
      <Box mt={2}>
        <Button
          fullWidth
          onClick={onDismiss}
          style={{ height: '40px', borderRadius: 12 }}
        >
          {t('dismiss')}
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
  currencyToAdd?: Currency | undefined;
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React();

  // if on L2 and txn is submitted, close automatically (if open)
  useEffect(() => {
    if (isOpen && chainId && hash) {
      onDismiss();
    }
  }, [chainId, hash, isOpen, onDismiss]);

  if (!chainId) return null;

  // confirmation screen
  // if on L2 and submitted dont render content, as should auto dismiss
  // need this to skip submitted view during state update ^^
  return (
    <CustomModal open={isOpen} onClose={onDismiss}>
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
            currencyToAdd={currencyToAdd}
          />
        ) : (
          content()
        )}
      </Box>
    </CustomModal>
  );
}
