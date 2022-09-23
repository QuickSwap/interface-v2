import { Currency } from '@uniswap/sdk-core';
import React, { ReactNode, useContext, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { ThemeContext } from 'styled-components/macro';
import { RowBetween, RowFixed } from '../Row';
import {
  AlertTriangle,
  ArrowUpCircle,
  CheckCircle,
  ExternalLink,
  X,
} from 'react-feather';
import { ButtonLight } from '../Button';
import { AutoColumn } from '../Column';
import Circle from 'assets/images/blue-loader.svg';
import MetaMaskLogo from 'assets/images/metamask-logo.svg';
import { useActiveWeb3React } from 'hooks';
import useAddTokenToMetamask from 'hooks/v3/useAddTokenToMetamask';
import {
  BottomSection,
  ConfirmedIcon,
  Section,
  StyledLogo,
  Wrapper,
} from './styled';
import { CustomModal } from 'components';
import { CloseIcon, CustomLightSpinner } from 'theme/components';
import { ExplorerDataType, getEtherscanLink } from 'utils';
import { StyledButton, StyledLabel } from '../Common/styledElements';

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
        <StyledLabel className=' mb-05' fontSize='16px' color='#c7cad9'>
          Waiting For Confirmation
        </StyledLabel>
        <StyledLabel className=' mb-05' fontSize='14px' color='#c7cad9'>
          {pendingText}
        </StyledLabel>

        <StyledLabel className=' mb-05' fontSize='14px' color='#696c80'>
          {' Confirm this transaction in your wallet'}
        </StyledLabel>
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
  const theme = useContext(ThemeContext);

  const { library } = useActiveWeb3React();

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd);

  return (
    <div>
      {!inline && (
        <RowBetween>
          <div />
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
      )}
      <ConfirmedIcon inline={inline}>
        <ArrowUpCircle
          strokeWidth={0.5}
          size={inline ? '40px' : '90px'}
          color={theme.winterMainButton}
        />
      </ConfirmedIcon>
      <AutoColumn gap='12px' justify={'center'}>
        <StyledLabel fontSize={'20px'} className='text-center'>
          Transaction Submitted
        </StyledLabel>
        {chainId && hash && (
          <ExternalLink
            href={getEtherscanLink(chainId, hash, ExplorerDataType.TRANSACTION)}
          >
            <StyledLabel fontSize={'14px'} color={theme.winterMainButton}>
              View on Explorer
            </StyledLabel>
          </ExternalLink>
        )}
        {currencyToAdd && library?.provider?.isMetaMask && (
          <ButtonLight
            mt='12px'
            padding='6px 12px'
            width='fit-content'
            onClick={addToken}
          >
            {!success ? (
              <RowFixed>
                Add {currencyToAdd.symbol} to Metamask{' '}
                <StyledLogo src={MetaMaskLogo} />
              </RowFixed>
            ) : (
              <RowFixed>
                Added ${currencyToAdd.symbol}
                <CheckCircle
                  size={'16px'}
                  stroke={'var(--green)'}
                  style={{ marginLeft: '6px' }}
                />
              </RowFixed>
            )}
          </ButtonLight>
        )}
        <StyledButton
          onClick={onDismiss}
          style={{ margin: '20px 0 0 0', color: 'white' }}
        >
          {inline ? 'Return' : 'Close'}
        </StyledButton>
      </AutoColumn>
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
      {bottomContent && (
        <BottomSection gap='12px'>{bottomContent()}</BottomSection>
      )}
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
  const theme = useContext(ThemeContext);
  return (
    <Wrapper>
      <Section>
        <RowBetween>
          <StyledLabel fontSize={'20px'}>Error</StyledLabel>
          <CloseIcon onClick={onDismiss} />
        </RowBetween>
        <AutoColumn
          style={{ marginTop: 20, padding: '2rem 0' }}
          gap='24px'
          justify='center'
        >
          <AlertTriangle
            color={theme.red1}
            style={{ strokeWidth: 1.5 }}
            size={64}
          />
          <StyledLabel
            fontSize={'16px'}
            color={theme.red1}
            style={{
              textAlign: 'center',
              width: '85%',
              wordBreak: 'break-word',
            }}
          >
            {message}
          </StyledLabel>
        </AutoColumn>
      </Section>
      <BottomSection gap='12px'>
        <StyledButton onClick={onDismiss}>Dismiss</StyledButton>
      </BottomSection>
    </Wrapper>
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
