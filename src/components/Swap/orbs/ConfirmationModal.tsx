import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Box, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import TransactionFailed from 'assets/images/TransactionFailed.png';
import TransactionSubmitted from 'assets/images/TransactionSubmitted.png';
import ModalBg from 'assets/images/ModalBG.svg';
import { Currency, ETHER, WETH } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import { SwapFlow, SwapStatus, SwapStep } from '@orbs-network/swap-ui';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { formatNumber, getEtherscanLink } from 'utils';
import useWrapCallback, { WrapType } from './hooks/useWrapCallback';
import { Steps } from './types';
import 'components/styles/orbs/ConfirmationModal.scss';
import CustomModal from 'components/CustomModal';
import { useGetLogoCallback } from './hooks';

const Context = createContext({} as ContextValues);

interface ContextProps extends ContextValues {
  children: React.ReactNode;
}

export const useConfirmationContext = () => {
  return useContext(Context);
};

export const ConfirmationProvider = (props: ContextProps) => {
  return <Context.Provider value={props}>{props.children}</Context.Provider>;
};

interface SharedProps {
  inCurrency?: Currency;
  outCurrency?: Currency;
  isOpen: boolean;
  onDismiss: () => void;
  swapStatus?: SwapStatus;
  inAmount?: string;
  outAmount?: string;
}

interface ContextValues extends SharedProps {
  currentStep?: number;
  steps?: SwapStep[];
}

interface Props extends SharedProps {
  errorContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  successContent?: React.ReactNode;
}

export const ConfirmationModal = (props: Props) => {
  return (
    <ConfirmationProvider {...props}>
      <Content
        mainContent={props.mainContent}
        errorContent={props.errorContent}
        successContent={props.successContent}
      />
    </ConfirmationProvider>
  );
};

const Content = ({
  mainContent,
  errorContent,
  successContent,
}: {
  mainContent: React.ReactNode;
  errorContent: React.ReactNode;
  successContent: React.ReactNode;
}) => {
  const { isOpen, onDismiss, inAmount, outAmount } = useConfirmationContext();
  const getLogo = useGetLogoCallback();
  const { inCurrency, outCurrency, swapStatus } = useConfirmationContext();

  const inToken = useMemo(() => {
    return {
      symbol: inCurrency?.symbol,
      logo: getLogo(inCurrency),
    };
  }, [inCurrency, getLogo]);

  const outToken = useMemo(() => {
    return {
      symbol: outCurrency?.symbol,
      logo: getLogo(outCurrency),
    };
  }, [outCurrency, getLogo]);

  return (
    <CustomModal
      open={isOpen}
      onClose={onDismiss}
      modalWrapper='orbsModalWrapper'
    >
      <img src={ModalBg} alt='Modal Back' className='txModalBG' />
      <SwapFlow
        inAmount={formatNumber(inAmount).toString()}
        outAmount={formatNumber(outAmount).toString()}
        inToken={inToken}
        outToken={outToken}
        swapStatus={swapStatus}
        successContent={successContent}
        failedContent={errorContent}
        mainContent={mainContent}
      />
    </CustomModal>
  );
};

export function ConfirmationContainer({
  title,
  children,
  className = '',
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { onDismiss } = useConfirmationContext();
  return (
    <Box padding={4} width='100%'>
      <Box className='txModalHeader'>
        <h5>{title}</h5>
        <CloseIcon onClick={onDismiss} />
      </Box>
      <Box
        className={`orbsTxModalContent ${className} flex items-center flex-col`}
        position='relative'
        zIndex={2}
      >
        {children}
      </Box>
    </Box>
  );
}

export const Error = ({
  shouldUnwrap,
  error,
}: {
  shouldUnwrap?: boolean;
  error?: string;
}) => {
  const { onDismiss, inAmount } = useConfirmationContext();
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const nativeSymbol = ETHER[chainId].symbol;

  const { execute, wrapType } = useWrapCallback(
    WETH[chainId],
    ETHER[chainId],
    inAmount,
  );
  const [success, setSuccess] = useState(false);
  const isLoading = wrapType === WrapType.UNWRAPPING;
  const unwrap = useCallback(async () => {
    try {
      await execute?.();
      setSuccess(true);
    } catch (error) {
      console.error(error);
    }
  }, [execute]);

  if (success) {
    return (
      <Success
        content={
          <p>
            {t('successfullyUnwrappedMATIC', {
              symbol: `${formatNumber(inAmount, 3)} ${nativeSymbol}`,
            })}
          </p>
        }
      />
    );
  }

  if (isLoading) {
    return (
      <ConfirmationContainer>
        <SwapFlow.StepLayout
          status='loading'
          body={<p>{t('unwrappingMATIC', { symbol: nativeSymbol })}</p>}
        />
      </ConfirmationContainer>
    );
  }

  return (
    <ConfirmationContainer className='orbsErrorContent' title={t('txFailed')}>
      <Box>
        <img src={TransactionFailed} alt='Transaction Failed' />
        {error && <p className='orbsErrorContentText'>Transaction Failed</p>}
      </Box>
      {shouldUnwrap ? (
        <Box className='orbsErrorContentButtons'>
          <Button className='txSubmitButton' onClick={unwrap}>
            {t('unwrap')}
          </Button>
          <Button className='txSubmitButton' onClick={onDismiss}>
            {t('close')}
          </Button>
        </Box>
      ) : (
        <>
          <Button className='txSubmitButton' onClick={onDismiss}>
            {t('close')}
          </Button>
        </>
      )}
    </ConfirmationContainer>
  );
};

export const Main = ({
  steps = [],
  swapDetails,
  swapButton,
  currentStep,
  inUsd,
  outUsd,
  inTitle,
  outTitle,
}: {
  steps?: SwapStep[];
  swapDetails: ReactNode;
  swapButton: ReactNode;
  currentStep?: Steps;
  inUsd?: string;
  outUsd?: string;
  inTitle?: string;
  outTitle?: string;
}) => {
  const { swapStatus } = useConfirmationContext();
  const { t } = useTranslation();

  return (
    <ConfirmationContainer title={!swapStatus ? 'confirmTx' : ''}>
      <SwapFlow.Review
        inUsd={inUsd && `$${inUsd}`}
        outUsd={outUsd && `$${outUsd}`}
        fromTitle={inTitle || t('sell')}
        toTitle={outTitle || t('buy')}
        steps={steps}
        currentStep={currentStep}
      />
      {!swapStatus && (
        <>
          {swapDetails}
          {swapButton}
        </>
      )}
    </ConfirmationContainer>
  );
};

export const Success = ({
  txHash,
  content,
}: {
  txHash?: string;
  content: ReactNode;
}) => {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const { onDismiss } = useConfirmationContext();

  return (
    <ConfirmationContainer
      className='orbs_SuccessContent'
      title={t('txCompleted')}
    >
      <img src={TransactionSubmitted} alt='Transaction Submitted' />
      <Box className='txModalContent txModalContentSuccess'>{content}</Box>
      <div className='orbsSuccessContentButtons'>
        {chainId && txHash && (
          <a
            className='orbsSuccessContentButtonsLink'
            href={getEtherscanLink(chainId, txHash, 'transaction')}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button className='txSubmitButton'>{t('viewTx')}</Button>
          </a>
        )}
        <Button className='txSubmitButton' onClick={onDismiss}>
          {t('close')}
        </Button>
      </div>
    </ConfirmationContainer>
  );
};

ConfirmationModal.Main = Main;
ConfirmationModal.Error = Error;
ConfirmationModal.Success = Success;
