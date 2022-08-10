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
import { useRouterContract } from './useContract';
import useTransactionDeadline from './useTransactionDeadline';
import useENS from './useENS';
import { Version } from './useToggledVersion';
import {
  constructBuildTx,
  constructGetRate,
  constructPartialSDK,
  constructSimpleSDK,
  SwapSide,
} from '@paraswap/sdk';
import { OptimalRate } from 'paraswap-core';
import { AddressInput } from 'components';
import { ethers } from 'ethers';
import { exception } from 'react-ga';
import { ChainId } from '@gelatonetwork/limit-orders-react/dist/hooks/useGasPrice';
import { useApproveCallback } from './useApproveCallback';
import { MaxUint256 } from '@uniswap/sdk-core';

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

type EstimatedSwapCall = SuccessfulCall | FailedCall;

/**
 * Returns the swap calls that can be used to make the trade
 * @param trade trade to execute
 * @param allowedSlippage user allowed slippage
 * @param recipientAddressOrName
 */
function useSwapCallArguments(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = GlobalConst.utils.INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null, // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): SwapCall[] {
  const { account, chainId, library } = useActiveWeb3React();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient =
    recipientAddressOrName === null ? account : recipientAddress;
  const deadline = useTransactionDeadline();
  const contract = useRouterContract();

  return useMemo(() => {
    const tradeVersion = Version.v2;
    if (
      !trade ||
      !recipient ||
      !library ||
      !account ||
      !tradeVersion ||
      !chainId
    )
      return [];

    if (!contract) {
      return [];
    }

    const swapMethods = [];

    switch (tradeVersion) {
      case Version.v2:
        swapMethods.push(
          Router.swapCallParameters(trade, {
            feeOnTransfer: false,
            allowedSlippage: new Percent(
              JSBI.BigInt(allowedSlippage),
              GlobalConst.utils.BIPS_BASE,
            ),
            recipient,
            ttl: deadline
              ? deadline.toNumber()
              : GlobalConst.utils.DEFAULT_DEADLINE_FROM_NOW,
          }),
        );

        if (trade.tradeType === TradeType.EXACT_INPUT) {
          swapMethods.push(
            Router.swapCallParameters(trade, {
              feeOnTransfer: true,
              allowedSlippage: new Percent(
                JSBI.BigInt(allowedSlippage),
                GlobalConst.utils.BIPS_BASE,
              ),
              recipient,
              ttl: deadline
                ? deadline.toNumber()
                : GlobalConst.utils.DEFAULT_DEADLINE_FROM_NOW,
            }),
          );
        }
        break;
    }
    return swapMethods.map((parameters) => ({ parameters, contract }));
  }, [
    account,
    allowedSlippage,
    chainId,
    deadline,
    library,
    recipient,
    trade,
    contract,
  ]);
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
  const paraswap = useMemo(() => {
    const paraswapSDK = constructSimpleSDK({
      network: <number>chainId,
      fetch: window.fetch,
    });

    return paraswapSDK;
  }, [library, chainId]);

  const addTransaction = useTransactionAdder();

  const { address: recipientAddress } = useENS(recipientAddressOrName);
  const recipient =
    recipientAddressOrName === null ? account : recipientAddress;

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
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
        const srcAmount = trade.inputAmount
          .multiply(JSBI.BigInt(10 ** trade.inputAmount.currency.decimals))
          .toFixed(0);
        const destAmount = trade
          .minimumAmountOut(pct)
          .multiply(JSBI.BigInt(10 ** trade.outputAmount.currency.decimals))
          .toFixed(0);
        const referrer = 'Quickswap';

        const lastPathIndex = trade.route.path.length - 1;
        const srcToken = trade.route.path[0].address;
        const destToken = trade.route.path[lastPathIndex].address;
        const priceRoute = await paraswap.getRate({
          srcToken,
          destToken,
          amount: srcAmount,
          userAddress: account,
          side: SwapSide.SELL,
          options: {
            includeDEXS: 'quickswap,quickswapv3',
          },
        });

        const txParams = await paraswap.buildTx({
          srcToken,
          destToken,
          srcAmount,
          destAmount,
          priceRoute,
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
