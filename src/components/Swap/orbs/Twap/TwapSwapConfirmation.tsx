import React, { useCallback, useMemo } from 'react';
import OrbsLogo from 'assets/images/orbs-logo.svg';
import { useTranslation } from 'react-i18next';
import { Box, Button } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import {
  useDerivedTwapSwapData,
  useFillDelayAsText,
  useInputTitle,
  useTradePrice,
} from './hooks';
import { useGetLogoCallback } from 'components/Swap/orbs/hooks';
import { fromRawAmount } from 'components/Swap/orbs/utils';
import { ORBS_WEBSITE, Steps, TWAP_WEBSITE } from '../consts';
import { SwapStep } from '@orbs-network/swap-ui';
import useUSDCPrice from 'utils/useUSDCPrice';
import { ConfirmationModal } from '../ConfirmationModal';
import { OrderDetails } from './Components/OrderDetails';
import { MarketPriceWarning } from './Components/Components';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import {
  PrepareOrderArgsResult,
  TwapAbi,
  zeroAddress,
} from '@orbs-network/twap-sdk';
import { useTwapApprovalCallback, useTwapOrdersQuery } from './hooks';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import { useContract } from 'hooks/useContract';
import { calculateGasMargin } from 'utils';
import { WETH } from '@uniswap/sdk';
import { useIsNativeCurrencyCallback } from '../hooks';
import { useTwapContext } from './TwapContext';
import { SwapStatus } from '@orbs-network/swap-ui';
import { isRejectedError } from '../utils';
import { BigNumber } from 'ethers';
import { useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { Field } from '../../../../state/swap/actions';
import { ConfirmationState } from '../ConfirmationModal';
import useWrapCallback from 'hooks/useWrapCallback';

export const useParseSteps = () => {
  const { currencies } = useTwapContext();
  const { t } = useTranslation();
  const getLogo = useGetLogoCallback();
  const inCurrency = currencies.INPUT;
  const orderType = useOrderType();

  return useCallback(
    (steps?: Steps[]) => {
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
    },
    [inCurrency, getLogo, t, orderType],
  );
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
  const derivedSwapValues = useDerivedTwapSwapData();
  const { chunks, fillDelay } = derivedSwapValues;
  const fillDelayAsText = useFillDelayAsText(fillDelay.unit * fillDelay.value);
  if (chunks === 1) return null;

  return (
    <p className='TwapFillDelayAndChunks'>{`Every ${fillDelayAsText} over ${chunks} trades`}</p>
  );
};

const SwapDetails = () => {
  const derivedSwapValues = useDerivedTwapSwapData();
  const {
    deadline,
    srcChunkAmount,
    chunks,
    fillDelay,
    destTokenMinAmount,
  } = derivedSwapValues;
  const { currencies, isMarketOrder } = useTwapContext();

  return (
    <>
      <FillDelayAndChunks />
      <OrderDetails>
        <Price />
        {isMarketOrder && <MarketPriceWarning />}
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
    </>
  );
};

const Price = () => {
  const { currencies, isMarketOrder } = useTwapContext();
  const tradePrice = useTradePrice();
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

const SwapButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation();
  const { currencies } = useTwapContext();
  const usd = useUSDCPrice(currencies.INPUT)?.toSignificant();
  const isLoading = !usd;

  return (
    <Button disabled={isLoading} fullWidth onClick={onClick}>
      {isLoading ? t('loading') : t('confirmOrder')}
    </Button>
  );
};

const MainContent = () => {
  const { inInputTitle, outInputTitle } = useInputTitle();
  const { t } = useTranslation();
  const { isMarketOrder, parsedAmount, currencies } = useTwapContext();
  const derivedSwapValues = useDerivedTwapSwapData();
  const parseSteps = useParseSteps();
  const { mutateAsync: onSubmit } = useSubmitOrderCallback();

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
      parseSteps={parseSteps}
      swapDetails={<SwapDetails />}
      SwapButton={SwapButton}
      inTitle={inInputTitle}
      outTitle={outInputTitle}
      inUsd={inUsd.toLocaleString('en')}
      outUsd={isMarketOrder ? '' : outUsd.toLocaleString('en')}
      onSubmit={onSubmit}
    />
  );
};

const ErrorContent = () => {
  return <ConfirmationModal.Error />;
};

export function Content({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const { isMarketOrder, parsedAmount, currencies } = useTwapContext();
  const derivedSwapValues = useDerivedTwapSwapData();
  const tradeDestAmount = derivedSwapValues?.destTokenAmount;

  return (
    <ConfirmationModal
      inCurrency={currencies.INPUT}
      outCurrency={currencies.OUTPUT}
      inAmount={fromRawAmount(
        currencies.INPUT,
        parsedAmount?.raw.toString(),
      )?.toExact()}
      outAmount={fromRawAmount(
        currencies.OUTPUT,
        isMarketOrder ? '' : tradeDestAmount,
      )?.toExact()}
      isOpen={isOpen}
      onDismiss={onDismiss}
      successContent={<SuccessContent />}
      mainContent={<MainContent />}
      errorContent={<ErrorContent />}
    />
  );
}

export const TwapSwapConfirmation = ({
  isOpen,
  onDismiss,
}: {
  isOpen: boolean;
  onDismiss: () => void;
}) => {
  return <Content isOpen={isOpen} onDismiss={onDismiss} />;
};

const useGetStepsCallback = () => {
  const isNativeIn = useIsNativeCurrencyCallback();
  const { isApproved } = useTwapApprovalCallback();
  const { currencies } = useTwapContext();
  return useCallback(() => {
    const steps: Steps[] = [];

    if (isNativeIn(currencies[Field.INPUT])) {
      steps.push(Steps.WRAP);
    }
    if (!isApproved) {
      steps.push(Steps.APPROVE);
    }
    steps.push(Steps.SWAP);
    return steps;
  }, [currencies, isApproved, isNativeIn]);
};

const useWrap = () => {
  const { currencies, parsedAmount, twapSDK } = useTwapContext();
  const { chainId } = useActiveWeb3React();
  const { execute: wrap } = useWrapCallback(
    currencies[Field.INPUT],
    WETH[chainId],
    parsedAmount?.toExact(),
  );

  return useMutation({
    mutationFn: async () => {
      twapSDK.analytics.onWrapRequest();
      await wrap?.();
      twapSDK.analytics.onWrapSuccess();
    },
    onError: (error) => {
      twapSDK.analytics.onWrapError(error);
      throw error;
    },
  });
};

const useApproval = () => {
  const { approve } = useTwapApprovalCallback();
  const { twapSDK } = useTwapContext();
  return useMutation({
    mutationFn: async () => {
      twapSDK.analytics.onApproveRequest();
      await approve();
      twapSDK.analytics.onApproveSuccess();
    },
    onError: (error) => {
      twapSDK.analytics.onApproveError(error);
      throw error;
    },
  });
};

const useCreateOrder = () => {
  const { twapSDK } = useTwapContext();
  const { account } = useActiveWeb3React();
  const tokenContract = useContract(twapSDK.config.twapAddress, TwapAbi);

  return useMutation({
    mutationFn: async (orderArgs: PrepareOrderArgsResult) => {
      if (!tokenContract) {
        throw new Error('Missing tokenContract');
      }
      twapSDK.analytics.onCreateOrderRequest(orderArgs, account);
      const gasEstimate = await tokenContract.estimateGas.ask(orderArgs);
      const txResponse = await tokenContract.functions.ask(orderArgs, {
        gasLimit: calculateGasMargin(gasEstimate),
      });

      const txReceipt = await txResponse.wait();
      let orderId: number | undefined = undefined;
      try {
        orderId = BigNumber.from(txReceipt.events[0].args[0]).toNumber();
        twapSDK.analytics.onCreateOrderSuccess(
          txReceipt.transactionHash,
          orderId,
        );
      } catch (error) {
        console.log({ error });
      }
      return {
        txReceipt,
        orderId,
      };
    },
    onError: (error) => {
      twapSDK.analytics.onCreateOrderError(error);
      throw error;
    },
  });
};

const useOnCreateOrderSuccess = () => {
  const { fetchUpdatedOrders } = useTwapOrdersQuery();
  const { onUpdatingOrders, onUserInput } = useTwapSwapActionHandlers();

  return useCallback(
    async (id?: number) => {
      onUserInput(Field.INPUT, '');
      onUpdatingOrders(true);
      await fetchUpdatedOrders(id);
      onUpdatingOrders(false);
    },
    [fetchUpdatedOrders, onUpdatingOrders, onUserInput],
  );
};

const useGetOrderArgs = () => {
  const { twapSDK } = useTwapContext();
  const { parsedAmount, currencies } = useTwapContext();
  const derivedSwapValues = useDerivedTwapSwapData();
  const { chainId } = useActiveWeb3React();
  const isNative = useIsNativeCurrencyCallback();

  return useCallback(() => {
    const srcToken = wrappedCurrency(currencies[Field.INPUT], chainId);
    const destToken = wrappedCurrency(currencies[Field.OUTPUT], chainId);
    if (!srcToken || !destToken) {
      throw new Error('Missing token');
    }
    return twapSDK.prepareOrderArgs({
      fillDelay: derivedSwapValues.fillDelay,
      deadline: derivedSwapValues.deadline,
      srcAmount: parsedAmount?.raw.toString() ?? '0',
      destTokenMinAmount: derivedSwapValues.destTokenMinAmount,
      srcChunkAmount: derivedSwapValues.srcChunkAmount,
      srcTokenAddress: srcToken.address,
      destTokenAddress: isNative(currencies[Field.OUTPUT])
        ? zeroAddress
        : destToken.address,
    });
  }, [currencies, parsedAmount, derivedSwapValues, chainId, twapSDK, isNative]);
};

const useSubmitOrderCallback = () => {
  const { twapSDK } = useTwapContext();
  const { account } = useActiveWeb3React();
  const dispatch = useAppDispatch();
  const getSteps = useGetStepsCallback();
  const { mutateAsync: approve } = useApproval();
  const { mutateAsync: wrap } = useWrap();
  const { mutateAsync: createOrder } = useCreateOrder();
  const getOrderArgs = useGetOrderArgs();
  const onSuccess = useOnCreateOrderSuccess();

  return useMutation(
    async (updateStore: (value: ConfirmationState) => void) => {
      let shouldUnwrap = false;

      try {
        const orderArgs = getOrderArgs();
        const steps = getSteps();
        twapSDK.analytics.onCreateOrderRequest(orderArgs, account);
        updateStore({ steps, swapStatus: SwapStatus.LOADING });

        if (steps.includes(Steps.WRAP)) {
          updateStore({ currentStep: Steps.WRAP });
          await wrap();
          shouldUnwrap = true;
          updateStore({ shouldUnwrap: true });
        }

        if (steps.includes(Steps.APPROVE)) {
          updateStore({ currentStep: Steps.APPROVE });
          await approve();
        }
        updateStore({ currentStep: Steps.SWAP });

        const { txReceipt, orderId } = await createOrder(orderArgs);
        onSuccess(orderId);
        updateStore({
          swapStatus: SwapStatus.SUCCESS,
        });
        dispatch(updateUserBalance());
        return txReceipt;
      } catch (error) {
        if (isRejectedError(error) && !shouldUnwrap) {
          updateStore({
            swapStatus: undefined,
          });
        } else {
          updateStore({
            shouldUnwrap: shouldUnwrap,
            swapStatus: SwapStatus.FAILED,
            error: (error as Error).message,
          });
        }
      }
    },
  );
};
