import OrbsLogo from 'assets/images/orbs-logo.svg';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import { useGetLogoCallback } from '../hooks';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Currency, WETH } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import {
  fromRawAmount,
  subtractSlippage,
  isRejectedError,
  isTimeoutError,
  promiseWithTimeout,
} from '../utils';
import { OptimalRate } from '@paraswap/sdk';
import { useParaswap } from 'hooks/useParaswap';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useIsNativeCurrencyCallback, useApproval } from '../hooks';
import {
  ORBS_WEBSITE,
  SIGNATURE_TIMEOUT,
  Steps,
  SWAP_COUNTDOWN,
} from '../consts';
import { LIQUIDITY_HUB_WEBSITE, SwapStatus } from '@orbs-network/swap-ui';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { Quote, permit2Address } from '@orbs-network/liquidity-hub-sdk';
import {
  ConfirmationModal,
  useConfirmationContext,
  ConfirmationState,
} from '../ConfirmationModal';
import useUSDCPrice, { useUSDCPriceFromAddress } from 'utils/useUSDCPrice';
import React, { useState } from 'react';
import { createContext } from 'react';
import { useLiquidityHubSDK } from './hooks';
import useWrapCallback from 'hooks/useWrapCallback';
import { useSwapActionHandlers } from 'state/swap/hooks';
import { Field } from 'state/swap/actions';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';

export interface LiquidityHubConfirmationProps {
  inCurrency?: Currency;
  outCurrency?: Currency;
  isOpen: boolean;
  onDismiss: () => void;
  getLatestQuote: () => Quote | undefined;
  quote?: Quote | null;
  onSwapFailed: () => void;
  optimalRate?: OptimalRate;
  allowedSlippage?: number;
  onLiquidityHubSwapInProgress: (value: boolean) => void;
  inAmount?: string;
}
export interface LiquidityHubConfirmationState {
  acceptedQuote?: Quote | null;
  signature?: string;
}

// types
interface ContextValues extends LiquidityHubConfirmationProps {
  quote?: Quote | null;
  signature?: string;
  onSignature: (signature: string) => void;
  onAcceptQuote: (quote: Quote) => void;
}
const Context = createContext({} as ContextValues);

interface ContextProps extends LiquidityHubConfirmationProps {
  children: React.ReactNode;
}

// context

const ContextProvider = ({ children, ...props }: ContextProps) => {
  const [acceptedQuote, setAcceptedQuote] = useState<Quote | undefined>(
    undefined,
  );
  const [signature, setSignature] = useState<string | undefined>(undefined);
  const quote = acceptedQuote || props.quote;
  const onDismiss = useCallback(() => {
    setSignature(undefined);
    setAcceptedQuote(undefined);
    props.onDismiss();
  }, [props, setSignature, setAcceptedQuote]);

  const onSignature = useCallback(
    (signature: string) => {
      setSignature(signature);
    },
    [setSignature],
  );

  const onAcceptQuote = useCallback(
    (quote: Quote) => {
      setAcceptedQuote(quote);
    },
    [setAcceptedQuote],
  );

  return (
    <Context.Provider
      value={{
        ...props,
        quote,
        onDismiss,
        onSignature,
        onAcceptQuote,
        signature,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useLiquidityHubConfirmationContext = () => React.useContext(Context);

const useLiquidityHubApproval = () => {
  const { inCurrency, inAmount } = useLiquidityHubConfirmationContext();

  return useApproval(
    permit2Address,
    inCurrency,
    fromRawAmount(inCurrency, inAmount)?.toExact(),
  );
};

const useAmounts = () => {
  const {
    quote,
    inCurrency,
    outCurrency,
  } = useLiquidityHubConfirmationContext();
  const inAmount = fromRawAmount(inCurrency, quote?.inAmount);
  const outAmount = fromRawAmount(outCurrency, quote?.referencePrice);
  const inUsd =
    Number(useUSDCPrice(inCurrency)?.toSignificant() ?? 0) *
    Number(inAmount?.toExact() || 0);
  const outUsd =
    Number(useUSDCPrice(outCurrency)?.toSignificant() ?? 0) *
    Number(outAmount?.toExact() || 0);

  return {
    inAmount,
    outAmount,
    inUsd,
    outUsd,
  };
};

const useParseSteps = () => {
  const { inCurrency, signature } = useLiquidityHubConfirmationContext();
  const getLogo = useGetLogoCallback();

  return useCallback(
    (steps?: Steps[]) => {
      if (!steps) return [];
      return steps.map((step) => {
        if (step === Steps.WRAP) {
          return {
            title: `Wrap ${inCurrency?.symbol}`,
            icon: <img src={getLogo(inCurrency)} />,
            id: Steps.WRAP,
          };
        }
        if (step === Steps.APPROVE) {
          return {
            title: `Approve ${inCurrency?.symbol} spending`,
            icon: <CheckCircleIcon />,
            id: Steps.APPROVE,
          };
        }

        return {
          id: Steps.SWAP,
          title: !signature ? 'Confirm swap' : 'Swap pending...',
          icon: <SwapVerticalCircleIcon />,
          timeout: !signature ? SIGNATURE_TIMEOUT : SWAP_COUNTDOWN,
        };
      });
    },
    [inCurrency, signature, getLogo],
  );
};

// ui components
const SuccessContent = () => {
  const {
    state: { txHash },
  } = useConfirmationContext();
  const { t } = useTranslation();
  return (
    <ConfirmationModal.Success
      txHash={txHash}
      content={
        <Box className='LiquidityHubSuccessContent'>
          {t('swapSuccess')}
          <span>{t(' using')}</span> <br />
          <a href={LIQUIDITY_HUB_WEBSITE} target='_blank' rel='noreferrer'>
            {t('liquidityHub')}
          </a>{' '}
          {t('by')}{' '}
          <a href={ORBS_WEBSITE} target='_blank' rel='noreferrer'>
            {t('orbs')}
            <img src={OrbsLogo} />
          </a>
        </Box>
      }
    />
  );
};

const SwapDetails = () => {
  const { t } = useTranslation();
  const { quote, outCurrency } = useLiquidityHubConfirmationContext();
  const minAmountOut = fromRawAmount(outCurrency, quote?.minAmountOut);

  return (
    <Box className='transactionText'>
      <p className='small'>
        {t('outputEstimated1', {
          amount: formatCurrencyAmount(minAmountOut, 4),
          symbol: minAmountOut?.currency?.symbol,
        })}
      </p>
    </Box>
  );
};

const SwapButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  const { isPending } = useLiquidityHubApproval();

  return (
    <Button disabled={isPending} fullWidth onClick={onClick}>
      {isPending ? t('loading') : t('confirmSwap')}
    </Button>
  );
};

const MainContent = () => {
  const parseSteps = useParseSteps();
  const { mutate: onSubmit } = useLiquidityHubSwapCallback();

  const { inUsd, outUsd } = useAmounts();
  return (
    <ConfirmationModal.Main
      parseSteps={parseSteps}
      swapDetails={<SwapDetails />}
      inUsd={inUsd.toLocaleString('en')}
      outUsd={outUsd.toLocaleString('en')}
      onSubmit={onSubmit}
      SwapButton={SwapButton}
    />
  );
};

function Content() {
  const {
    inCurrency,
    outCurrency,
    isOpen,
    onDismiss,
  } = useLiquidityHubConfirmationContext();
  const { inAmount, outAmount } = useAmounts();
  useLiquidityHubApproval();

  return (
    <ConfirmationModal
      inCurrency={inCurrency}
      outCurrency={outCurrency}
      inAmount={inAmount?.toExact()}
      outAmount={outAmount?.toExact()}
      isOpen={isOpen}
      onDismiss={onDismiss}
      successContent={<SuccessContent />}
      mainContent={<MainContent />}
      errorContent={<ConfirmationModal.Error />}
    />
  );
}

export const LiquidityHubSwapConfirmation = (
  props: LiquidityHubConfirmationProps,
) => {
  return (
    <ContextProvider {...props}>
      <Content />
    </ContextProvider>
  );
};

const useGetStepsCallback = () => {
  const { inCurrency } = useLiquidityHubConfirmationContext();
  const isNativeIn = useIsNativeCurrencyCallback();
  const { isApproved } = useLiquidityHubApproval();

  return useCallback(() => {
    const steps: Steps[] = [];

    if (isNativeIn(inCurrency)) {
      steps.push(Steps.WRAP);
    }
    if (!isApproved) {
      steps.push(Steps.APPROVE);
    }
    steps.push(Steps.SWAP);
    return steps;
  }, [inCurrency, isApproved, isNativeIn]);
};

const useWrapFlowCallback = () => {
  const { inCurrency, quote } = useLiquidityHubConfirmationContext();
  const inAmount = fromRawAmount(inCurrency, quote?.inAmount);
  const { chainId } = useActiveWeb3React();
  const liquidityHub = useLiquidityHubSDK();
  const { execute: wrap } = useWrapCallback(
    inCurrency,
    WETH[chainId],
    inAmount?.toExact(),
  );

  return useMutation({
    mutationFn: async () => {
      liquidityHub.analytics.onWrapRequest();
      return wrap?.();
    },
    onError: (error: any) => {
      liquidityHub.analytics.onWrapFailure(error);
      throw error;
    },
    onSuccess: () => {
      liquidityHub.analytics.onWrapSuccess();
    },
  });
};

const useApproveCallback = () => {
  const { approve } = useLiquidityHubApproval();
  const liquidityHub = useLiquidityHubSDK();

  return useMutation({
    mutationFn: async () => {
      liquidityHub.analytics.onApprovalRequest();
      return approve();
    },
    onError: (error: any) => {
      liquidityHub.analytics.onApprovalFailed(error.message);
      throw error;
    },
    onSuccess: () => {
      liquidityHub.analytics.onApprovalSuccess();
    },
  });
};

const useSwapCallback = () => {
  const liquidityHub = useLiquidityHubSDK();
  const { mutateAsync: getParaswapTxParams } = useParaswapTxParamsCallback();

  return useMutation({
    mutationFn: async ({
      acceptedQuote,
      signature,
    }: {
      acceptedQuote: Quote;
      signature: string;
    }) => {
      const txParams = await getParaswapTxParams();

      const txHash = await liquidityHub.swap(acceptedQuote, signature, {
        data: txParams?.data || '',
        to: txParams?.to,
      });
      return txHash;
    },
  });
};

// submit swap hook
const useLiquidityHubSwapCallback = () => {
  const { chainId, account, library } = useActiveWeb3React();
  const {
    onSwapFailed,
    onSignature,
    onAcceptQuote,
    inCurrency,
    outCurrency,
    getLatestQuote,
    onLiquidityHubSwapInProgress,
    quote,
  } = useLiquidityHubConfirmationContext();
  const { mutateAsync: signCallback } = useSignEIP712Callback();
  const getSteps = useGetStepsCallback();
  const { mutateAsync: swapCallback } = useSwapCallback();
  const { mutateAsync: wrapCallback } = useWrapFlowCallback();
  const { mutateAsync: approvalCallback } = useApproveCallback();
  const onTradeSuccess = useOnTradeSuccessCallback();
  const { onUserInput } = useSwapActionHandlers();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (
      updateStore: (value: Partial<ConfirmationState>) => void,
    ) => {
      let shouldUnwrap = false;

      try {
        const inToken = wrappedCurrency(inCurrency, chainId);
        const outToken = wrappedCurrency(outCurrency, chainId);
        onLiquidityHubSwapInProgress(true);
        if (!account || !library || !inToken || !outToken) {
          throw new Error('useLiquidityHubSwapCallback missing atgs');
        }

        const steps = getSteps();
        updateStore({
          swapStatus: SwapStatus.LOADING,
          steps,
        });
        if (steps.includes(Steps.WRAP)) {
          updateStore({
            currentStep: Steps.WRAP,
          });
          await wrapCallback();
          shouldUnwrap = true;
        }
        if (steps.includes(Steps.APPROVE)) {
          updateStore({ currentStep: Steps.APPROVE });
          await approvalCallback();
        }

        const acceptedQuote = getLatestQuote() || quote;

        if (!acceptedQuote) {
          throw new Error('missing  quote');
        }

        onAcceptQuote(acceptedQuote);
        updateStore({ currentStep: Steps.SWAP });
        const signature = await signCallback(acceptedQuote.permitData);
        onSignature(signature);

        const txHash = await swapCallback({
          acceptedQuote,
          signature,
        });

        const transaction = await library.getTransaction(txHash);
        const receipt = await transaction.wait();
        onUserInput(Field.INPUT, '');
        dispatch(updateUserBalance());
        updateStore({ swapStatus: SwapStatus.SUCCESS });
        onTradeSuccess(acceptedQuote);
        return receipt;
      } catch (error) {
        const isRejectedOrTimeout =
          isRejectedError(error) || isTimeoutError(error);

        if (!shouldUnwrap && isRejectedOrTimeout) {
          updateStore({ swapStatus: undefined });
        } else {
          updateStore({
            shouldUnwrap,
            swapStatus: SwapStatus.FAILED,
            error: (error as any).message,
          });
          onSwapFailed();
        }
      } finally {
        onLiquidityHubSwapInProgress(false);
      }
    },
  });
};

const useOnTradeSuccessCallback = () => {
  const liquidityHubSDK = useLiquidityHubSDK();
  const { outCurrency } = useLiquidityHubConfirmationContext();
  const { chainId } = useActiveWeb3React();
  const outToken = wrappedCurrency(outCurrency, chainId);
  const outTokenUsdPrice = useUSDCPriceFromAddress(outToken?.address).price;

  return useCallback(
    (acceptedQuote: Quote) => {
      try {
        if (!outCurrency) return;
        const amount =
          fromRawAmount(outCurrency, acceptedQuote.outAmount)?.toExact() || '0';
        const tradeUsdValue = Number(amount) * outTokenUsdPrice;

        liquidityHubSDK.analytics.onTradeSuccess(
          acceptedQuote.outAmount,
          tradeUsdValue.toString(),
          'liquidity-hub',
        );
      } catch (error) {}
    },
    [liquidityHubSDK, outTokenUsdPrice, outToken, outCurrency],
  );
};

const useParaswapTxParamsCallback = () => {
  const paraswap = useParaswap();
  const { account, chainId } = useActiveWeb3React();
  const {
    allowedSlippage,
    optimalRate,
    inCurrency,
  } = useLiquidityHubConfirmationContext();

  return useMutation({
    mutationFn: async () => {
      const inToken = wrappedCurrency(inCurrency, chainId);
      if (!optimalRate || !allowedSlippage || !inToken || !account) {
        throw new Error('useParaswapTxParamsCallback missing args');
      }
      try {
        const result = await paraswap.buildTx(
          {
            srcToken: inToken.address,
            destToken: optimalRate.destToken,
            srcAmount: optimalRate.srcAmount,
            destAmount: optimalRate.destAmount,
            priceRoute: optimalRate,
            userAddress: account,
            receiver: account,
            partner: 'quickswapv3',
          },
          {
            ignoreChecks: true,
          },
        );

        return result;
      } catch (error) {
        console.log('paraswapTxParams', error);
      }
    },
  });
};

const useSignEIP712Callback = () => {
  const { library, account } = useActiveWeb3React();
  const liquidityHub = useLiquidityHubSDK();

  return useMutation({
    mutationFn: async (permitData: any) => {
      liquidityHub.analytics.onSignatureRequest();
      if (!library || !account) {
        throw new Error('No library or account');
      }
      const signature = await signEIP712(account, library.provider, permitData);
      if (!signature) {
        throw new Error('No signature');
      }
      return signature;
    },
    onError: (error: any) => {
      liquidityHub.analytics.onSignatureFailed(error.message);
      throw error;
    },
    onSuccess: (signature) => {
      liquidityHub.analytics.onSignatureSuccess(signature);
    },
  });
};

async function signEIP712(signer: string, provider: any, permitData: any) {
  const populated = await _TypedDataEncoder.resolveNames(
    permitData.domain,
    permitData.types,
    permitData.values,
    async (name: string) => name,
  );

  const message = JSON.stringify(
    _TypedDataEncoder.getPayload(
      populated.domain,
      permitData.types,
      populated.value,
    ),
  );

  try {
    return await signAsync(signer, provider, 'eth_signTypedData_v4', message);
  } catch (e) {
    if (isRejectedError(e)) {
      throw e;
    }
    try {
      return await signAsync(signer, provider, 'eth_signTypedData', message);
    } catch (error) {
      if (
        typeof error.message === 'string' &&
        (error.message.match(/not (found|implemented)/i) ||
          error.message.match(/TrustWalletConnect.WCError error 1/) ||
          error.message.match(/Missing or invalid/))
      ) {
        throw new Error('Wallet does not support EIP-712');
      } else {
        throw error;
      }
    }
  }
}

async function signAsync(
  signer: string,
  provider: any,
  method: 'eth_signTypedData_v4' | 'eth_signTypedData',
  message: string,
) {
  try {
    return await provider?.request({
      method,
      params: [signer, message],
    });
  } catch (error) {
    throw error;
  }
}
