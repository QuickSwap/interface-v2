import React, { useMemo } from 'react';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import { useSubmitOrderCallback } from './useSubmitOrderCallback';
import {
  ContextProvider,
  useTwapConfirmationContext,
} from './TwapSwapConfirmationContext';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import { useFillDelayAsText, useTwapApprovalCallback } from '../hooks';
import { Steps } from 'components/Swap/orbs/types';
import { useGetLogoCallback } from 'components/Swap/orbs/hooks';
import { fromRawAmount } from 'components/Swap/orbs/utils';
import { ORBS_WEBSITE, TWAP_WEBSITE } from '../../consts';
import { SwapStep } from '@orbs-network/swap-ui';
import useUSDCPrice from 'utils/useUSDCPrice';
import { ConfirmationModal } from '../../ConfirmationModal';
import { OrderDetails } from '../Components/OrderDetails';
import { useTwapContext } from '../TwapContext';
import { MarketPriceWarning } from '../Components/Components';

export const useSteps = () => {
  const { currencies } = useTwapContext();
  const { t } = useTranslation();
  const {
    state: { steps },
  } = useTwapConfirmationContext();
  const getLogo = useGetLogoCallback();
  const inCurrency = currencies.INPUT;
  const orderType = useOrderType();

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
      title: `${t('create')} ${orderType}`,

      icon: <SwapVerticalCircleIcon />,
      id: Steps.SWAP,
    });
    return result;
  }, [steps, inCurrency, getLogo, t, orderType]);
};

const useOrderType = () => {
  const { isLimitPanel, isMarketOrder } = useTwapContext();
  const { t } = useTranslation();

  return useMemo(() => {
    if (isLimitPanel) {
      return `${t('limitOrder')} `;
    }
    if (isMarketOrder) {
      return `${t('twapMarketOrder')}`;
    }
    return `${t('twapLimitOrder')}`;
  }, [isLimitPanel, isMarketOrder, t]);
};
const SuccessContent = ({ txHash }: { txHash?: string }) => {
  const { isLimitPanel } = useTwapContext();
  const { t } = useTranslation();

  const orderType = useOrderType();

  return (
    <ConfirmationModal.Success
      txHash={txHash}
      content={
        <p className='TwapSwapConfirmationSuccess'>
          {`${orderType} ${t('created')}`}
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

const FillDelayAndChunks = () => {
  const { derivedSwapValues } = useTwapContext();
  const { chunks, fillDelay } = derivedSwapValues;
  const fillDelayAsText = useFillDelayAsText(fillDelay.unit * fillDelay.value);
  if (chunks === 1) return null;

  return (
    <p className='TwapFillDelayAndChunks'>{`Every ${fillDelayAsText} over ${chunks} trades`}</p>
  );
};

const SwapDetails = () => {
  const {
    derivedSwapValues: {
      chunks,
      fillDelay,
      destTokenMinAmount,
      srcChunkAmount,
    },
    tradeDeadline,
    currencies,
    isMarketOrder,
  } = useTwapContext();

  return (
    <>
      <FillDelayAndChunks />
      <OrderDetails>
        <Price />
        {isMarketOrder && <MarketPriceWarning />}
        <OrderDetails.Deadline deadline={tradeDeadline} />
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
    </>
  );
};

const Price = () => {
  const { tradePrice, currencies, isMarketOrder } = useTwapContext();
  const parsedTradePrice = fromRawAmount(currencies.OUTPUT, tradePrice);
  const usd =
    Number(useUSDCPrice(currencies.OUTPUT)?.toSignificant() ?? 0) *
    Number(parsedTradePrice?.toExact() || 0);

  return (
    <Box className='TwapConfirmationPrice'>
      <OrderDetails.Price
        price={parsedTradePrice?.toExact()}
        inCurrency={currencies.INPUT}
        outCurrency={currencies.OUTPUT}
        usd={usd}
        isMarketOrder={isMarketOrder}
      />
    </Box>
  );
};

const SwapButton = () => {
  const { t } = useTranslation();
  const { mutate: createOrder } = useSubmitOrderCallback();
  const { currencies } = useTwapContext();
  const usd = useUSDCPrice(currencies.INPUT)?.toSignificant();
  const isLoading = !usd;

  return (
    <Box className='swapButtonWrapper'>
      <Box width='100%'>
        <Button disabled={isLoading} fullWidth onClick={() => createOrder()}>
          {isLoading ? t('loading') : t('confirmOrder')}
        </Button>
      </Box>
    </Box>
  );
};

const MainContent = () => {
  const {
    state: { currentStep },
    inInputTitle,
    outInputTitle,
  } = useTwapConfirmationContext();
  const {
    currencies,
    derivedSwapValues,
    parsedAmount,
    isMarketOrder,
  } = useTwapContext();
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
      inTitle={inInputTitle}
      outTitle={outInputTitle}
      inUsd={inUsd.toLocaleString('en')}
      outUsd={isMarketOrder ? '' : outUsd.toLocaleString('en')}
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
  const {
    currencies,
    parsedAmount,
    derivedSwapValues,
    isMarketOrder,
  } = useTwapContext();

  const tradeDestAmount = derivedSwapValues?.destTokenAmount;

  return (
    <ConfirmationModal
      inCurrency={currencies.INPUT}
      outCurrency={currencies.OUTPUT}
      inAmount={fromRawAmount(
        currencies.INPUT,
        parsedAmount?.raw.toString(),
      )?.toExact()}
      outAmount={
        isMarketOrder
          ? ''
          : fromRawAmount(currencies.OUTPUT, tradeDestAmount)?.toExact()
      }
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
  inInputTitle: string;
  outInputTitle: string;
}) => {
  return (
    <ContextProvider {...props}>
      <Content />
    </ContextProvider>
  );
};
