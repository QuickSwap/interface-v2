import React, {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
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
import 'components/styles/orbs/ConfirmationModal.scss';
import CustomModal from 'components/CustomModal';
import { useGetLogoCallback } from './hooks';
import useWrapCallback, { WrapType } from 'hooks/useWrapCallback';
import { Steps } from './consts';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import { styled } from '@material-ui/styles';

interface SharedProps {
  inCurrency?: Currency;
  outCurrency?: Currency;
  isOpen: boolean;
  onDismiss: () => void;
  inAmount?: string;
  outAmount?: string;
}

interface ContextValues extends SharedProps {
  currentStep?: number;
  steps?: SwapStep[];
  resetStore: () => void;
  updateStore: (payload: Partial<ConfirmationState>) => void;
  state: ConfirmationState;
}

export type ConfirmationState = {
  swapStatus?: SwapStatus;
  currentStep?: Steps;
  shouldUnwrap?: boolean;
  txHash?: string;
  steps?: Steps[];
  error?: string;
};

interface ConfirmationModalProps extends SharedProps {
  errorContent?: React.ReactNode;
  mainContent?: React.ReactNode;
  successContent?: React.ReactNode;
}

type Action<TState> =
  | { type: 'UPDATE_STATE'; payload: Partial<TState> }
  | { type: 'RESET' };

function reducer<TState>(
  state: TState,
  action: Action<TState>,
  initialState: TState,
): TState {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const useConfirmationStore = (initialState: ConfirmationState) => {
  const [state, dispatch] = useReducer(
    (state: ConfirmationState, action: Action<ConfirmationState>) =>
      reducer(state, action, initialState),
    initialState,
  );

  const updateStore = useCallback(
    (payload: Partial<ConfirmationState>) => {
      dispatch({ type: 'UPDATE_STATE', payload });
    },
    [dispatch],
  );

  const resetStore = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  return {
    store: state,
    updateStore,
    resetStore,
  };
};

const Context = createContext({} as ContextValues);

export const useConfirmationContext = () => {
  return useContext(Context);
};

const ConfirmationProvider = (props: ContextProps) => {
  const dispatch = useAppDispatch();
  const { updateStore, store, resetStore } = useConfirmationStore(
    {} as ConfirmationState,
  );

  const onDismiss = useCallback(() => {
    if (store.swapStatus) {
      dispatch(updateUserBalance());
    }
    setTimeout(() => {
      resetStore();
    }, 5_00);
    props.onDismiss();
  }, [props, resetStore, store.swapStatus, dispatch]);

  return (
    <Context.Provider
      value={{
        ...props,
        onDismiss,
        state: store,
        updateStore,
        resetStore,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
interface ContextProps extends SharedProps {
  children: React.ReactNode;
}

export const ConfirmationModal = (props: ConfirmationModalProps) => {
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
  const {
    isOpen,
    onDismiss,
    inAmount,
    outAmount,
    inCurrency,
    outCurrency,
    state: { swapStatus },
  } = useConfirmationContext();
  const getLogo = useGetLogoCallback();

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
      <StyledSwapFlow
        inAmount={!inAmount ? '' : formatNumber(inAmount).toString()}
        outAmount={!outAmount ? '' : formatNumber(outAmount).toString()}
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

const StyledSwapFlow = styled(SwapFlow)({
  '& .orbs_MainTokenLogo': {
    background: 'white',
  },
  '& .orbs_TradePreviewToken img': {
    background: 'white',
  },
});

function ConfirmationContainer({
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

export const Error = () => {
  const {
    onDismiss: _onDismiss,
    inAmount,
    state: { shouldUnwrap },
  } = useConfirmationContext();
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const nativeSymbol = ETHER[chainId].symbol;
  const wSymbol = WETH[chainId].symbol;
  const [isLoading, setIsLoading] = useState(false);

  const { execute, inputError } = useWrapCallback(
    WETH[chainId],
    ETHER[chainId],
    inAmount,
  );

  const [success, setSuccess] = useState(false);
  const unwrap = useCallback(async () => {
    try {
      setIsLoading(true);
      await execute?.();
      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [execute]);

  const onDismiss = useCallback(() => {
    _onDismiss();
    setSuccess(false);
  }, [_onDismiss]);

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
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img src={TransactionFailed} alt='Transaction Failed' />
        {shouldUnwrap && (
          <p className='orbsErrorContentText'>
            {t('wrapError', { native: nativeSymbol, wrapped: wSymbol })}
          </p>
        )}
      </Box>
      {!inputError && shouldUnwrap ? (
        <Box className='orbsErrorContentButtons'>
          <Button className='txSubmitButton' onClick={unwrap}>
            {t('unwrap')}
          </Button>
          <Button className='txSubmitButton' onClick={onDismiss}>
            {t('close')}
          </Button>
        </Box>
      ) : (
        <Box className='orbsErrorContentButtons'>
          <Button className='txSubmitButton' onClick={onDismiss}>
            {t('close')}
          </Button>
        </Box>
      )}
    </ConfirmationContainer>
  );
};

export const Main = ({
  parseSteps,
  swapDetails,
  SwapButton,
  inUsd,
  outUsd,
  inTitle,
  outTitle,
  onSubmit: _onSubmit,
}: {
  parseSteps: (value?: Steps[]) => SwapStep[] | undefined;
  swapDetails: ReactNode;
  SwapButton: FC<{ onClick: () => void }>;
  inUsd?: string;
  outUsd?: string;
  inTitle?: string;
  outTitle?: string;
  onSubmit: (value: any) => void;
}) => {
  const {
    state: { currentStep, steps, swapStatus },
    updateStore,
  } = useConfirmationContext();
  const { t } = useTranslation();

  const parsedSteps = useMemo(() => parseSteps(steps), [parseSteps, steps]);

  const onSubmit = useCallback(() => {
    _onSubmit(updateStore);
  }, [_onSubmit, updateStore]);

  return (
    <ConfirmationContainer title={!swapStatus ? t('confirmTx') : ''}>
      <SwapFlow.Main
        inUsd={inUsd && `$${inUsd}`}
        outUsd={outUsd && `$${outUsd}`}
        fromTitle={inTitle || t('sell')}
        toTitle={outTitle || t('buy')}
        steps={parsedSteps}
        currentStep={currentStep}
      />
      {!swapStatus && (
        <>
          {swapDetails}
          <Box className='swapButtonWrapper'>
            <Box width='100%'>
              <SwapButton onClick={onSubmit} />
            </Box>
          </Box>
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
