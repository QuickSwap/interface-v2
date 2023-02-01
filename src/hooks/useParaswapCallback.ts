import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/providers';
import { Currency, SwapParameters } from '@uniswap/sdk';
import { useMemo } from 'react';
import { GlobalConst, RouterTypes, SmartRouter } from 'constants/index';
import { useTransactionAdder } from 'state/transactions/hooks';
import { isAddress, shortenAddress, getSigner } from 'utils';
import { useActiveWeb3React } from 'hooks';
import useENS from './useENS';
import { OptimalRate } from 'paraswap-core';
import { useParaswap } from './useParaswap';
import ParaswapABI from 'constants/abis/ParaSwap_ABI.json';
import { useContract } from './useContract';
import callWallchainAPI from 'utils/wallchainService';
import { useSwapActionHandlers } from 'state/swap/hooks';
import { ONE } from 'v3lib/utils';

export enum SwapCallbackState {
  INVALID,
  LOADING,
  VALID,
}

interface SwapCall {
  contract: Contract;
  parameters: SwapParameters;
}

interface SuccessfulCall {
  call: SwapCall;
  gasEstimate: BigNumber;
}

interface FailedCall {
  call: SwapCall;
  error: Error;
}

const convertToEthersTransaction = (txParams: any): TransactionRequest => {
  return {
    to: txParams.to,
    from: txParams.from,
    data: txParams.data,
    chainId: txParams.chainId,
    gasPrice: txParams.gasPrice,
    gasLimit: txParams.gas,
    value: txParams.value,
  };
};

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useParaswapCallback(
  priceRoute: OptimalRate | undefined,
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  inputCurrency?: Currency,
  outputCurrency?: Currency,
): {
  state: SwapCallbackState;
  callback:
    | null
    | (() => Promise<{ response: TransactionResponse; summary: string }>);
  error: string | null;
} {
  const { account, chainId, library } = useActiveWeb3React();
  const paraswap = useParaswap();
  const { onBestRoute, onSetSwapDelay } = useSwapActionHandlers();

  const addTransaction = useTransactionAdder();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient =
    recipientAddressOrName === null ? account : recipientAddress;

  const paraswapContract = useContract(
    priceRoute?.contractAddress,
    ParaswapABI,
  );

  return useMemo(() => {
    if (!priceRoute || !library || !account || !chainId) {
      return {
        state: SwapCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      };
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return {
          state: SwapCallbackState.INVALID,
          callback: null,
          error: 'Invalid recipient',
        };
      } else {
        return {
          state: SwapCallbackState.LOADING,
          callback: null,
          error: null,
        };
      }
    }

    const referrer = 'quickswapv3';

    const srcToken = priceRoute.srcToken;
    const destToken = priceRoute.destToken;

    //TODO: we need to support max impact
    // if (minDestAmount.greaterThan(JSBI.BigInt(priceRoute.destAmount))) {
    //   throw new Error('Price Rate updated beyond expected slipage rate');
    // }
    // const minDestAmount = new Fraction(ONE)
    //   .add(allowedSlippage)
    //   .invert()
    //   .multiply(priceRoute.destAmount).quotient;

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<{
        response: TransactionResponse;
        summary: string;
      }> {
        let txParams;

        try {
          txParams = await paraswap.buildTx({
            srcToken,
            destToken,
            srcAmount: priceRoute.srcAmount,
            destAmount: priceRoute.destAmount,
            priceRoute: priceRoute,
            userAddress: account,
            receiver: recipient,
            partner: referrer,
          });
        } catch (e) {
          console.log(e);
          throw new Error(
            'For rebase or taxed tokens, try market V2 instead of best trade.',
          );
        }

        if (txParams.data && paraswapContract) {
          const response = await callWallchainAPI(
            priceRoute.contractMethod,
            txParams.data,
            txParams.value,
            chainId,
            account,
            paraswapContract,
            SmartRouter.PARASWAP,
            RouterTypes.SMART,
            onBestRoute,
            onSetSwapDelay,
            100,
          );

          const swapRouterAddress = chainId
            ? GlobalConst.addresses.SWAP_ROUTER_ADDRESS[chainId]
            : undefined;
          if (
            response &&
            response.pathFound &&
            response.transactionArgs.data &&
            swapRouterAddress
          ) {
            txParams.to = swapRouterAddress;
            txParams.data = response.transactionArgs.data;
          }
        }

        const signer = getSigner(library, account);
        const ethersTxParams = convertToEthersTransaction(txParams);
        try {
          const response = await signer.sendTransaction(ethersTxParams);
          const inputSymbol = inputCurrency?.symbol;
          const outputSymbol = outputCurrency?.symbol;
          const inputAmount =
            Number(priceRoute.srcAmount) / 10 ** priceRoute.srcDecimals;
          const outputAmount =
            Number(priceRoute.destAmount) / 10 ** priceRoute.destDecimals;

          const base = `Swap ${inputAmount.toLocaleString(
            'us',
          )} ${inputSymbol} for ${outputAmount.toLocaleString(
            'us',
          )} ${outputSymbol}`;
          const withRecipient =
            recipient === account
              ? base
              : `${base} to ${
                  recipientAddressOrName && isAddress(recipientAddressOrName)
                    ? shortenAddress(recipientAddressOrName)
                    : recipientAddressOrName
                }`;

          const withVersion = withRecipient;

          addTransaction(response, {
            summary: withVersion,
          });

          return { response, summary: withVersion };
        } catch (error) {
          if (error?.code === 4001) {
            throw new Error('Transaction rejected.');
          } else {
            throw new Error(`Swap failed: ${error.message}`);
          }
        }
      },
      error: null,
    };
  }, [
    priceRoute,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    paraswap,
    paraswapContract,
    onBestRoute,
    onSetSwapDelay,
    inputCurrency?.symbol,
    outputCurrency?.symbol,
    addTransaction,
  ]);
}
