import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import {
  PrepareOrderArgsResult,
  TwapAbi,
  zeroAddress,
} from '@orbs-network/twap-sdk';
import { useCallback, useMemo, useRef } from 'react';
import { useTwapApprovalCallback, useTwapOrdersQuery } from '../hooks';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import { useContract } from 'hooks/useContract';
import { calculateGasMargin } from 'utils';
import { useTwapConfirmationContext } from './TwapSwapConfirmationContext';
import { WETH } from '@uniswap/sdk';
import { Steps } from 'components/Swap/orbs/types';
import { useIsNativeCurrencyCallback } from '../../hooks';
import { useTwapContext } from '../TwapContext';
import { SwapStatus } from '@orbs-network/swap-ui';
import useWrapCallback from '../../hooks/useWrapCallback';
import { isRejectedError } from '../../utils';
import { BigNumber } from 'ethers';
import { useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { Field } from '../../../../../state/swap/actions';

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
  const { twapSDK, currencies, parsedAmount } = useTwapContext();
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
  const { onUpdatingOrders } = useTwapSwapActionHandlers();

  return useCallback(
    async (id?: number) => {
      onUpdatingOrders(true);
      await fetchUpdatedOrders(id);
      onUpdatingOrders(false);
    },
    [fetchUpdatedOrders, onUpdatingOrders],
  );
};

const useGetOrderArgs = () => {
  const {
    twapSDK,
    parsedAmount,
    currencies,
    derivedSwapValues,
    tradeDeadline
  } = useTwapContext();
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
      deadline: tradeDeadline,
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

export const useSubmitOrderCallback = () => {
  const { twapSDK } = useTwapContext();
  const { account } = useActiveWeb3React();
  const dispatch = useAppDispatch();
  const { updateStore } = useTwapConfirmationContext();
  const getSteps = useGetStepsCallback();
  const { mutateAsync: approve } = useApproval();
  const { mutateAsync: wrap } = useWrap();
  const { mutateAsync: createOrder } = useCreateOrder();
  const getOrderArgs = useGetOrderArgs();
  const onSuccess = useOnCreateOrderSuccess();

  return useMutation(async () => {
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
  });
};
