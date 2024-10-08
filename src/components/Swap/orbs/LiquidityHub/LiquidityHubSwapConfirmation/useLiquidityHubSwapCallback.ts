import { useMutation } from '@tanstack/react-query';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import { useCallback, useRef } from 'react';
import { useLiquidityHubConfirmationContext } from './context';
import { Steps } from '../../types';
import { Token, WETH } from '@uniswap/sdk';
import { useActiveWeb3React } from 'hooks';
import {
  getDexMinAmountOut,
  isRejectedError,
  isTimeoutError,
  promiseWithTimeout,
} from '../../utils';
import { OptimalRate, TransactionParams } from '@paraswap/sdk';
import { useParaswap } from 'hooks/useParaswap';
import { wrappedCurrency } from 'utils/wrappedCurrency';
import { useLiquidityHubApproval } from '../useLiquidityHubApproval';
import { useIsNativeCurrencyCallback } from '../../hooks';
import { SIGNATURE_TIMEOUT } from '../../consts';
import useWrapCallback from '../../hooks/useWrapCallback';
import { SwapStatus } from '@orbs-network/swap-ui';
import { _TypedDataEncoder } from 'ethers/lib/utils';
import { useLiquidityHub } from '../hooks';
import { Quote } from '@orbs-network/liquidity-hub-sdk';

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
  const { inCurrency, inAmount } = useLiquidityHubConfirmationContext();
  const { chainId } = useActiveWeb3React();
  const liquidityHub = useLiquidityHub();
  const { execute: wrap } = useWrapCallback(
    inCurrency,
    WETH[chainId],
    inAmount?.toExact(),
  );

  return useCallback(async () => {
    try {
      liquidityHub.analytics.onWrapRequest();
      await wrap?.();
      liquidityHub.analytics.onWrapSuccess();
    } catch (error) {
      liquidityHub.analytics.onWrapFailure(error);
      throw error;
    }
  }, [wrap, liquidityHub]);
};

const useApproveCallback = () => {
  const { approve } = useLiquidityHubApproval();
  const liquidityHub = useLiquidityHub();

  return useCallback(async () => {
    try {
      liquidityHub.analytics.onApprovalRequest();
      await approve();
      liquidityHub.analytics.onApprovalSuccess();
    } catch (error) {
      liquidityHub.analytics.onApprovalFailed(error);
      throw error;
    }
  }, [approve, liquidityHub]);
};

const useSwapCallback = () => {
  const liquidityHub = useLiquidityHub();
  return useCallback(
    async ({
      acceptedQuote,
      signature,
      paraswapTxParams,
    }: {
      acceptedQuote: Quote;
      signature: string;
      paraswapTxParams?: TransactionParams;
    }) => {
      const txHash = await liquidityHub.swap(acceptedQuote, signature, {
        data: paraswapTxParams?.data || '',
        to: paraswapTxParams?.to,
      });
      const details = await liquidityHub.getTransactionDetails(
        txHash,
        acceptedQuote,
      );
      return {
        txHash,
        ...details,
      };
    },
    [liquidityHub],
  );
};

export const useLiquidityHubSwapCallback = () => {
  const { chainId, account } = useActiveWeb3React();
  const {
    updateStore,
    onSwapSuccess,
    resetStore,
    onSwapFailed,
    optimalRate,
    allowedSlippage,
    inCurrency,
    outCurrency,
    quoteQuery,
  } = useLiquidityHubConfirmationContext();
  const dispatch = useAppDispatch();
  const wrappedNative = useRef(false);
  const signCallback = useSignEIP712Callback();
  const getParaswapTxParams = useParaswapTxParamsCallback();
  const getSteps = useGetStepsCallback();
  const { ensureQueryData } = quoteQuery;
  const swapCallback = useSwapCallback();

  const wrapCallback = useWrapFlowCallback();
  const approvalCallback = useApproveCallback();

  return useMutation(
    async () => {
      const inToken = wrappedCurrency(inCurrency, chainId);
      const outToken = wrappedCurrency(outCurrency, chainId);
      if (!account) {
        throw new Error('Account is not defined');
      }
      if (!inToken) {
        throw new Error('In token is not defined');
      }
      if (!outToken) {
        throw new Error('Out token is not defined');
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
        wrappedNative.current = true;
      }
      if (steps.includes(Steps.APPROVE)) {
        updateStore({ currentStep: Steps.APPROVE });
        await approvalCallback();
        // refetch approval
      }

      const acceptedQuote = await ensureQueryData();

      updateStore({ currentStep: Steps.SWAP, acceptedQuote });

      const signature = await promiseWithTimeout(
        signCallback(acceptedQuote.permitData),
        SIGNATURE_TIMEOUT,
      );

      updateStore({ signature });
      let paraswapTxParams: TransactionParams | undefined;
      if (optimalRate && allowedSlippage) {
        try {
          paraswapTxParams = await getParaswapTxParams({
            inToken,
            optimalRate,
            allowedSlippage,
            chainId,
            account,
          });
        } catch (error) {}
      }
      return swapCallback({
        acceptedQuote,
        signature,
        paraswapTxParams,
      });
    },
    {
      onSuccess: () => {
        onSwapSuccess?.();
        updateStore({ swapStatus: SwapStatus.SUCCESS });
        dispatch(updateUserBalance());
      },
      onError: (error) => {
        const isRejectedOrTimeout =
          isRejectedError(error) || isTimeoutError(error);

        if (!wrappedNative.current && isRejectedOrTimeout) {
          resetStore();
        } else {
          updateStore({
            shouldUnwrap: wrappedNative.current,
            swapStatus: SwapStatus.FAILED,
            error: (error as any).message,
          });
          onSwapFailed?.();
        }
      },
      onSettled: () => {
        wrappedNative.current = false;
      },
    },
  );
};

const useParaswapTxParamsCallback = () => {
  const paraswap = useParaswap();

  return useCallback(
    (args: {
      inToken: Token;
      optimalRate?: OptimalRate;
      allowedSlippage?: number;
      account: string;
      chainId: number;
    }) => {
      if (!args.optimalRate) {
        throw new Error('Optimal rate is not defined');
      }
      return paraswap.buildTx({
        srcToken: args.inToken?.address,
        destToken: args.optimalRate.destToken,
        srcAmount: args.optimalRate.srcAmount,
        destAmount: getDexMinAmountOut(
          args.allowedSlippage ?? 0,
          args.optimalRate.destAmount,
        )!,
        priceRoute: args.optimalRate,
        userAddress: args.account,
        receiver: args.account,
        partner: 'quickswapv3',
      });
    },
    [paraswap],
  );
};

export const useSignEIP712Callback = () => {
  const { library, account } = useActiveWeb3React();
  const liquidityHub = useLiquidityHub();

  return useCallback(
    async (permitData: any) => {
      liquidityHub.analytics.onSignatureRequest();
      if (!library || !account) {
        throw new Error('No library or account');
      }
      try {
        const signature = await signEIP712(
          account,
          library.provider,
          permitData,
        );
        if (!signature) {
          throw new Error('No signature');
        }
        liquidityHub.analytics.onSignatureSuccess(signature);
        return signature;
      } catch (error) {
        liquidityHub.analytics.onSignatureFailed((error as Error).message);
        throw error;
      }
    },
    [account, library, liquidityHub],
  );
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
