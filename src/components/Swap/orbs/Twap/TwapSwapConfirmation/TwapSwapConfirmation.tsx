import React, { useMemo } from 'react';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { useCreateOrderCallback } from './useCreateOrderCallback';
import { ContextProvider, useTwapConfirmationContext } from './context';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import { useTwapApprovalCallback } from '../hooks';
import { Steps } from 'components/Swap/orbs/types';
import { useGetLogoCallback } from 'components/Swap/orbs/hooks';
import { fromRawAmount } from 'components/Swap/orbs/utils';
import { ORBS_WEBSITE, TWAP_WEBSITE } from '../../consts';
import { SwapStep } from '@orbs-network/swap-ui';
import useUSDCPrice from 'utils/useUSDCPrice';
import { ConfirmationModal } from '../../ConfirmationModal';
import { OrderDetails } from '../OrderDetails';
import { useTwapContext } from '../context';

export const useSteps = () => {
  const { currencies } = useTwapContext();
  const { t } = useTranslation();
  const {
    state: { steps },
  } = useTwapConfirmationContext();
  const getLogo = useGetLogoCallback();
  const inCurrency = currencies.INPUT;

  return useMemo(() => {
    if (!steps) return [];
    const result: SwapStep[] = [];
    if (steps.includes(Steps.WRAP)) {
      result.push({
        title: t('wrapMATIC', { symbol: inCurrency?.symbol }),
        icon: <img src={getLogo(inCurrency)} />,
        id: Steps.WRAP,
      });
    }
    if (steps.includes(Steps.APPROVE)) {
      result.push({
        title: t('approveToken', { symbol: inCurrency?.symbol }),
        icon: <CheckCircleIcon />,
        id: Steps.APPROVE,
      });
    }

    result.push({
      title: t('createOrder'),
      icon: <SwapVerticalCircleIcon />,
      id: Steps.SWAP,
    });
    return result;
  }, [steps, inCurrency, getLogo, t]);
};

const SuccessContent = ({ txHash }: { txHash?: string }) => {
  const { isLimitPanel } = useTwapContext();
  const { t } = useTranslation();
  return (
    <ConfirmationModal.Success
      txHash={txHash}
      content={
        <p className='TwapSwapConfirmationSuccess'>
          {t('orderCreated')}
          <span>{t(' using')}</span>{' '}
          <a href={TWAP_WEBSITE} target='_blank' rel='noreferrer'>
            {isLimitPanel ? 'dLimit' : 'dTWAP'}
          </a>{' '}
          {t('by')}{' '}
          <a href={ORBS_WEBSITE} target='_blank' rel='noreferrer'>
            {t('orbs')}
            <img src={OrbsLogo} />
          </a>
        </p>
      }
    />
  );
};

const SwapDetails = () => {
  const {
    derivedSwapValues: {
      deadline,
      chunks,
      fillDelay,
      destTokenMinAmount,
      srcChunkAmount,
    },
    currencies,
    isMarketOrder,
  } = useTwapContext();

  return (
    <OrderDetails>
      <Price />
      <OrderDetails.Deadline deadline={deadline} />
      {chunks > 1 && (
        <OrderDetails.ChunkSize
          srcChunk={srcChunkAmount}
          inCurrency={currencies.INPUT}
        />
      )}
      <OrderDetails.Chunks totalChunks={chunks} />
      <OrderDetails.FillDelay fillDelay={fillDelay.unit * fillDelay.value} />
      <OrderDetails.MinReceived
        isMarketOrder={isMarketOrder}
        dstMinAmount={destTokenMinAmount}
        currency={currencies.OUTPUT}
      />
      <OrderDetails.Recipient />
    </OrderDetails>
  );
};

const Price = () => {
  const { t } = useTranslation();
  const { limitPrice, currencies, isMarketOrder } = useTwapContext();
  const parsedLimitPrice = fromRawAmount(currencies.OUTPUT, limitPrice);
  const usd =
    Number(useUSDCPrice(currencies.OUTPUT)?.toSignificant() ?? 0) *
    Number(parsedLimitPrice?.toExact() || 0);

  return (
    <Box className='TwapConfirmationPrice'>
      <OrderDetails.Price
        price={parsedLimitPrice?.toExact()}
        inCurrency={currencies.INPUT}
        outCurrency={currencies.OUTPUT}
        usd={usd}
      />
      {isMarketOrder && (
        <p className='TwapConfirmationPriceWarning'>
          {t('marketPriceWarning')}{' '}
          <a
            href='https://www.orbs.com/dtwap-and-dlimit-faq/'
            target='_blank'
            rel='noreferrer'
          >
            {t('learnMore')}
          </a>
        </p>
      )}
    </Box>
  );
};

const SwapButton = () => {
  const { t } = useTranslation();
  const { isPending: allowancePending } = useTwapApprovalCallback();
  const { mutate: createOrder } = useCreateOrderCallback();
  const { currencies } = useTwapContext();
  const usd = useUSDCPrice(currencies.INPUT)?.toSignificant();
  const isLoading = !usd || allowancePending;

  return (
    <Box className='swapButtonWrapper'>
      <Box width='100%'>
        <Button disabled={isLoading} fullWidth onClick={() => createOrder()}>
          {isLoading ? t('loading') : t('createOrder')}
        </Button>
      </Box>
    </Box>
  );
};

const MainContent = () => {
  const { t } = useTranslation();
  const { currentStep } = useTwapConfirmationContext().state;
  const { currencies, derivedSwapValues, parsedAmount } = useTwapContext();
  const steps = useSteps();
  const parsedTradeDestAmount = fromRawAmount(
    currencies.OUTPUT,
    derivedSwapValues.destTokenAmount,
  );
  const inUsd =
    Number(useUSDCPrice(currencies.INPUT)?.toSignificant() ?? 0) *
    Number(parsedAmount?.toExact() || 0);
  const outUsd =
    Number(useUSDCPrice(currencies.OUTPUT)?.toSignificant() ?? 0) *
    Number(parsedTradeDestAmount?.toExact() || 0);

  return (
    <ConfirmationModal.Main
      steps={steps}
      currentStep={currentStep}
      swapDetails={<SwapDetails />}
      swapButton={<SwapButton />}
      inTitle={t('allocate')}
      outTitle={t('buy')}
      inUsd={inUsd.toLocaleString('en')}
      outUsd={outUsd.toLocaleString('en')}
    />
  );
};

const ErrorContent = () => {
  const {
    state: { shouldUnwrap, error },
  } = useTwapConfirmationContext();
  return <ConfirmationModal.Error error={error} shouldUnwrap={shouldUnwrap} />;
};

export function Content() {
  const {
    isOpen,
    onDismiss,
    state: { swapStatus },
  } = useTwapConfirmationContext();
  const { currencies, parsedAmount, derivedSwapValues } = useTwapContext();

  const tradeDestAmount = derivedSwapValues?.destTokenAmount;

  return (
    <ConfirmationModal
      inCurrency={currencies.INPUT}
      outCurrency={currencies.OUTPUT}
      inAmount={fromRawAmount(
        currencies.INPUT,
        parsedAmount?.raw.toString(),
      )?.toExact()}
      outAmount={fromRawAmount(currencies.OUTPUT, tradeDestAmount)?.toExact()}
      isOpen={isOpen}
      swapStatus={swapStatus}
      onDismiss={onDismiss}
      successContent={<SuccessContent />}
      mainContent={<MainContent />}
      errorContent={<ErrorContent />}
    />
  );
}

export const TwapSwapConfirmation = (props: {
  isOpen: boolean;
  onDismiss: () => void;
}) => {
  return (
    <ContextProvider {...props}>
      <Content />
    </ContextProvider>
  );
};
