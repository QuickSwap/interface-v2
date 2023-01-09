import { Currency } from '@uniswap/sdk-core';
import React, { ReactNode, useContext, useEffect } from 'react';
import { Box, Button } from '@material-ui/core';
import { ThemeContext } from 'styled-components/macro';
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
    <div className={'p-1 w-100'}>
      {!inline && (
        <div className={'flex-s-between'}>
          <div />
          <X className={'c-w hover-op trans-op'} onClick={onDismiss} />
        </div>
      )}
      <div className={'f c f-ac f-jc mb-1 p-2'}>
        <CustomLightSpinner
          src={Circle}
          alt='loader'
          size={inline ? '40px' : '90px'}
        />
      </div>
      <div className={'f c f-ac ta-c'}>
        <p>{t('waitingConfirm')}</p>
        <small>{pendingText}</small>
        <small className='text-secondary'>{t('confirmTxinWallet')}</small>
      </div>
    </div>
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
  const theme = useContext(ThemeContext);

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
      <Box className='flex'>
        <ArrowUpCircle
          strokeWidth={0.5}
          size={inline ? '40px' : '90px'}
          color={theme.winterMainButton}
        />
      </Box>
      <Box>
        <h5>{t('txSubmitted')}</h5>
        {chainId && hash && (
          <ExternalLink
            href={getEtherscanLink(chainId, hash, ExplorerDataType.TRANSACTION)}
          >
            <small>{t('viewonBlockExplorer')}</small>
          </ExternalLink>
        )}
        {currencyToAdd && library?.provider?.isMetaMask && (
          <Button onClick={addToken}>
            {!success ? (
              <Box>
                {t('addToMetamaskToken', { symbol: currencyToAdd.symbol })}
                <img src={MetaMaskLogo} alt='Metamask' />
              </Box>
            ) : (
              <Box>
                {t('added')} {currencyToAdd.symbol}
                <CheckCircle
                  size={'16px'}
                  stroke={'var(--green)'}
                  style={{ marginLeft: '6px' }}
                />
              </Box>
            )}
          </Button>
        )}
        <Button
          onClick={onDismiss}
          style={{ margin: '20px 0 0 0', color: 'white' }}
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
    <div className={'w-100'}>
      <div className={'flex-s-between mb-1'}>
        {title}
        <CloseIcon className={'hover-op trans-op'} onClick={onDismiss} />
      </div>
      {topContent()}
      {bottomContent && <Box>{bottomContent()}</Box>}
    </div>
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
  const theme = useContext(ThemeContext);
  return (
    <Box>
      <Box>
        <Box className='flex justify-between'>
          <h5>{t('error')}</h5>
          <CloseIcon onClick={onDismiss} />
        </Box>
        <Box>
          <AlertTriangle
            color={theme.red1}
            style={{ strokeWidth: 1.5 }}
            size={64}
          />
          <p
            className='text-error'
            style={{
              textAlign: 'center',
              width: '85%',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </p>
        </Box>
      </Box>
      <Button onClick={onDismiss}>{t('dismiss')}</Button>
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
