import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import {
  PrepareOrderArgsResult,
  TwapAbi,
  zeroAddress,
} from '@orbs-network/twap-sdk';
import { useCallback, useRef } from 'react';
import { useTwapApprovalCallback, useTwapOrdersQuery } from '../hooks';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useActiveWeb3React } from 'hooks';
import { useContract } from 'hooks/useContract';
import { calculateGasMargin } from 'utils';
import { useTwapConfirmationContext } from './context';
import { WETH } from '@uniswap/sdk';
import { Steps } from 'components/Swap/orbs/types';
import { useIsNativeCurrencyCallback } from '../../hooks';
import { useTwapContext } from '../context';
import { SwapStatus } from '@orbs-network/swap-ui';
import useWrapCallback from '../../hooks/useWrapCallback';
import { isRejectedError } from '../../utils';
import { BigNumber } from 'ethers';
import { useTwapSwapActionHandlers } from 'state/swap/twap/hooks';
import { Field } from '../../../../../state/swap/actions';

const useGetStepsCallback = () => {
  const isNativeIn = useIsNativeCurrencyCallback();
  const { isApproved } = useTwapApprovalCallback();
  const {currencies} = useTwapContext();
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

const useWrapFlowCallback = () => {
  const { twapSDK, currencies, parsedAmount } = useTwapContext();
  const { chainId } = useActiveWeb3React();
  const { execute: wrap } = useWrapCallback(
    currencies[Field.INPUT],
    WETH[chainId],
    parsedAmount?.toExact(),
  );

  return useCallback(async () => {
    try {
      twapSDK.analytics.onWrapRequest();
      await wrap?.();
      twapSDK.analytics.onWrapSuccess();
    } catch (error) {
      twapSDK.analytics.onWrapError(error);
      throw error;
    }
  }, [wrap, twapSDK.analytics]);
};

const useApprovalFlowCallback = () => {
  const { approve } = useTwapApprovalCallback();
  const { twapSDK } = useTwapContext();
  return useCallback(async () => {
    try {
      twapSDK.analytics.onApproveRequest();
      await approve();
      twapSDK.analytics.onApproveSuccess();
    } catch (error) {
      twapSDK.analytics.onApproveError(error);
      throw error;
    }
  }, [approve]);
};

const useCreateOrderFlowCallback = () => {
  const { twapSDK } = useTwapContext();
  const { account } = useActiveWeb3React();
  const onSuccess = useOnCreateOrderSuccess();
  const tokenContract = useContract(twapSDK.config.twapAddress, TwapAbi);

  return useCallback(
    async (orderArgs: PrepareOrderArgsResult) => {
      if (!tokenContract) {
        throw new Error('Missing tokenContract');
      }
      twapSDK.analytics.onCreateOrderRequest(orderArgs, account);

      try {
        const gasEstimate = await tokenContract.estimateGas.ask(orderArgs);

        // Step 2: Send the transaction with calculated gas limit
        const txResponse = await tokenContract.functions.ask(orderArgs, {
          gasLimit: calculateGasMargin(gasEstimate), // Adjust gas limit with margin
        });

        // Step 3: Wait for the transaction to be mined
        const txReceipt = await txResponse.wait();
        try {
          const id = BigNumber.from(txReceipt.events[0].args[0]).toNumber();
          twapSDK.analytics.onCreateOrderSuccess(txReceipt.transactionHash, id);
          onSuccess(id);
        } catch (error) {
          console.log({ error });
        }
        return txReceipt; // Return the receipt of the mined transaction
      } catch (error) {
        twapSDK.analytics.onCreateOrderError(error);
        throw error;
      }
    },
    [tokenContract, twapSDK, account, onSuccess],
  );
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

export const useCreateOrderCallback = () => {
  const { twapSDK, parsedAmount, currencies, derivedSwapValues } = useTwapContext();
  const { chainId, account } = useActiveWeb3React();
  const dispatch = useAppDispatch();

  const isNative = useIsNativeCurrencyCallback();
  const { updateStore } = useTwapConfirmationContext();
  const getSteps = useGetStepsCallback();
  const shouldUnwrap = useRef(false);
  const approvalCallback = useApprovalFlowCallback();
  const wrapCallback = useWrapFlowCallback();
  const createOrderCallback = useCreateOrderFlowCallback();

  return useMutation(
    async () => {
      const srcToken = wrappedCurrency(currencies[Field.INPUT], chainId);
      const destToken = wrappedCurrency(currencies[Field.OUTPUT], chainId);

      if (!parsedAmount || !srcToken || !destToken) {
        throw new Error('Missing args');
      }
      const orderArgs = twapSDK.prepareOrderArgs({
        fillDelay: derivedSwapValues.fillDelay,
        deadline: derivedSwapValues.deadline,
        srcAmount: parsedAmount?.raw.toString(),
        destTokenMinAmount: derivedSwapValues.destTokenMinAmount,
        srcChunkAmount: derivedSwapValues.srcChunkAmount,
        srcTokenAddress: srcToken.address,
        destTokenAddress: isNative(currencies[Field.OUTPUT]) ? zeroAddress : destToken.address,
      });

      twapSDK.analytics.onCreateOrderRequest(orderArgs, account);
      const steps = getSteps();
      updateStore({ steps, swapStatus: SwapStatus.LOADING });
      if (steps.includes(Steps.WRAP)) {
        updateStore({ currentStep: Steps.WRAP });
        await wrapCallback();
        shouldUnwrap.current = true;
        updateStore({ shouldUnwrap: true });
      }

      if (steps.includes(Steps.APPROVE)) {
        updateStore({ currentStep: Steps.APPROVE });
        await approvalCallback();
      }
      updateStore({ currentStep: Steps.SWAP });

      const result = await createOrderCallback(orderArgs);
    },
    {
      onSuccess: () => {
        updateStore({
          swapStatus: SwapStatus.SUCCESS,
        });
        dispatch(updateUserBalance());
      },
      onError: (error) => {
        if (isRejectedError(error) && !shouldUnwrap.current) {
          updateStore({
            swapStatus: undefined,
          });
        } else {
          updateStore({
            shouldUnwrap: shouldUnwrap.current,
            swapStatus: SwapStatus.FAILED,
            error: (error as Error).message,
          });
        }
      },
      onSettled: () => {
        shouldUnwrap.current = false;
      },
    },
  );
};
