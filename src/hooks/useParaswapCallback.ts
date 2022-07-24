import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  TransactionResponse,
  TransactionRequest,
} from '@ethersproject/providers';
import {
  JSBI,
  Percent,
  Router,
  SwapParameters,
  Trade,
  TradeType,
} from '@uniswap/sdk';
import { useMemo } from 'react';
import { GlobalConst } from 'constants/index';
import { useTransactionAdder } from 'state/transactions/hooks';
import {
  calculateGasMargin,
  isZero,
  isAddress,
  shortenAddress,
  formatTokenAmount,
  basisPointsToPercent,
  getProviderOrSigner,
  getSigner,
} from 'utils';
import { useActiveWeb3React } from 'hooks';
import useENS from './useENS';
import { OptimalRate } from 'paraswap-core';
import { getBestTradeCurrencyAddress, useParaswap } from './useParaswap';
import { SwapSide } from '@paraswap/sdk';
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
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = GlobalConst.utils.INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): {
  state: SwapCallbackState;
  callback:
    | null
    | (() => Promise<{ response: TransactionResponse; summary: string }>);
  error: string | null;
} {
  const { account, chainId, library } = useActiveWeb3React();
  const paraswap = useParaswap();

  const addTransaction = useTransactionAdder();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient =
    recipientAddressOrName === null ? account : recipientAddress;

  return useMemo(() => {
    if (!trade || !priceRoute || !library || !account || !chainId) {
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

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<{
        response: TransactionResponse;
        summary: string;
      }> {
        const pct = basisPointsToPercent(allowedSlippage);
        const srcAmount = trade
          .maximumAmountIn(pct)
          .multiply(JSBI.BigInt(10 ** trade.inputAmount.currency.decimals))
          .toFixed(0);
        const minDestAmount = trade
          .minimumAmountOut(pct)
          .multiply(JSBI.BigInt(10 ** trade.outputAmount.currency.decimals));

        const referrer = 'Quickswap';

        const srcToken = getBestTradeCurrencyAddress(
          trade.inputAmount.currency,
        );
        const destToken = getBestTradeCurrencyAddress(
          trade.outputAmount.currency,
        );

        //Update the rate before calling swap
        const rate = await paraswap.getRate({
          srcToken,
          destToken,
          amount: srcAmount,
          side: SwapSide.SELL,
          options: {
            includeDEXS: 'quickswap,quickswapv3',
          },
        });

        if (minDestAmount.greaterThan(JSBI.BigInt(rate.destAmount))) {
          throw new Error('Price Rate updated beyond expected slipage rate');
        }

        const txParams = await paraswap.buildTx({
          srcToken,
          destToken,
          srcAmount,
          destAmount: minDestAmount.toFixed(0),
          priceRoute: rate,
          userAddress: account,
          partner: referrer,
        });

        const signer = getSigner(library, account);
        const ethersTxParams = convertToEthersTransaction(txParams);
        return signer
          .sendTransaction(ethersTxParams)
          .then((response: TransactionResponse) => {
            const inputSymbol = trade.inputAmount.currency.symbol;
            const outputSymbol = trade.outputAmount.currency.symbol;
            const inputAmount = formatTokenAmount(trade.inputAmount);
            const outputAmount = formatTokenAmount(trade.outputAmount);

            const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`;
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
          })
          .catch((error: any) => {
            // if the user rejected the tx, pass this along
            if (error?.code === 4001) {
              throw new Error('Transaction rejected.');
            } else {
              throw new Error(`Swap failed: ${error.message}`);
            }
          });
      },
      error: null,
    };
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    recipientAddressOrName,
    paraswap,
    addTransaction,
  ]);
}
