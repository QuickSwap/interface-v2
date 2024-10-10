import React, { useMemo } from 'react';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import { useTranslation } from 'react-i18next';
import { Box, Button, styled } from '@material-ui/core';
import { formatCurrencyAmount } from 'utils/v3/formatCurrencyAmount';
import { useLiquidityHubSwapCallback } from './useLiquidityHubSwapCallback';
import { ContextProvider, useLiquidityHubConfirmationContext } from './context';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import { LiquidityHubConfirmationProps, Steps } from '../../types';
import { useGetLogoCallback } from '../../hooks';
import { useLiquidityHubApproval } from '../useLiquidityHubApproval';
import {
  LIQUIDITY_HUB_WEBSITE,
  ORBS_WEBSITE,
  SIGNATURE_TIMEOUT,
  SWAP_COUNTDOWN,
} from '../../consts';
import { ConfirmationModal } from '../../ConfirmationModal';
import useUSDCPrice from 'utils/useUSDCPrice';

export const useSteps = () => {
  const {
    inCurrency,
    store: { signature, steps },
  } = useLiquidityHubConfirmationContext();
  const getLogo = useGetLogoCallback();

  return useMemo(() => {
    return steps?.map((step) => {
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
  }, [inCurrency, signature, steps, getLogo]);
};

const SuccessContent = () => {
  const {
    store: { txHash },
  } = useLiquidityHubConfirmationContext();
  const { t } = useTranslation();
  return (
    <ConfirmationModal.Success
      txHash={txHash}
      content={
        <StyledSuccess>
          {t('swapSuccess')}
          <span>{t(' using')}</span>{' '}
          <a href={LIQUIDITY_HUB_WEBSITE} target='_blank' rel='noreferrer'>
            {t('liquidityHub')}
          </a>{' '}
          {t('by')}{' '}
          <a href={ORBS_WEBSITE} target='_blank' rel='noreferrer'>
            Orbs
            <img src={OrbsLogo} />
          </a>
        </StyledSuccess>
      }
    />
  );
};

const SwapButton = () => {
  const { t } = useTranslation();
  const { mutate: swap } = useLiquidityHubSwapCallback();
  const { isPending } = useLiquidityHubApproval();

  return (
    <Box className='swapButtonWrapper'>
      <Box width='100%'>
        <Button disabled={isPending} fullWidth onClick={() => swap()}>
          {isPending ? t('loading') : t('confirmSwap')}
        </Button>
      </Box>
    </Box>
  );
};

const SwapDetails = () => {
  const { t } = useTranslation();
  const { minAmountOut } = useLiquidityHubConfirmationContext();

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

const MainContent = () => {
  const steps = useSteps();
  const {
    store: { currentStep },
    inAmount,
    inCurrency,
    outAmount,
    outCurrency,
  } = useLiquidityHubConfirmationContext();
  const inUsd =
    Number(useUSDCPrice(inCurrency)?.toSignificant() ?? 0) *
    Number(inAmount?.toExact() || 0);
  const outUsd =
    Number(useUSDCPrice(outCurrency)?.toSignificant() ?? 0) *
    Number(outAmount?.toExact() || 0);

  return (
    <ConfirmationModal.Main
      steps={steps}
      swapButton={<SwapButton />}
      swapDetails={<SwapDetails />}
      currentStep={currentStep}
      inUsd={inUsd.toLocaleString('en')}
      outUsd={outUsd.toLocaleString('en')}
    />
  );
};

const ErrorContent = () => {
  const {
    store: { shouldUnwrap, error },
  } = useLiquidityHubConfirmationContext();
  return <ConfirmationModal.Error error={error} shouldUnwrap={shouldUnwrap} />;
};

export function Content() {
  const {
    inCurrency,
    outCurrency,
    isOpen,
    onDismiss,
    inAmount,
    outAmount,
    store: { swapStatus },
  } = useLiquidityHubConfirmationContext();
  return (
    <ConfirmationModal
      swapStatus={swapStatus}
      inCurrency={inCurrency}
      outCurrency={outCurrency}
      inAmount={inAmount?.toExact()}
      outAmount={outAmount?.toExact()}
      isOpen={isOpen}
      onDismiss={onDismiss}
      successContent={<SuccessContent />}
      mainContent={<MainContent />}
      errorContent={<ErrorContent />}
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

const StyledSuccess = styled('p')({
  '& a': {
    textDecoration: 'none',
    display: 'inline-flex',
    gap: 5,
    fontWeight: 600,
    color: 'white',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  '& span': {
    textTransform: 'capitalize',
    fontSize: 'inherit',
  },
  '& img': {
    width: 22,
    height: 22,
    objectFit: 'contain',
  },
});
