import { TransactionResponse } from '@ethersproject/providers';
import {
  Currency,
  CurrencyAmount,
  MaxUint256,
  Percent,
  TradeType,
} from '@uniswap/sdk-core';
import { Trade as V3Trade } from 'lib/src/trade';
import { useCallback, useMemo, useState } from 'react';
import {
  SWAP_ROUTER_ADDRESSES,
  UNI_SWAP_ROUTER,
  ZAP_ADDRESS,
} from '../constants/v3/addresses';
import {
  useHasPendingApproval,
  useTransactionAdder,
} from '../state/transactions/hooks';
import { useTokenContract } from './useContract';
import { useActiveWeb3React } from 'hooks';
import { useV3TokenAllowance } from './useTokenAllowance';
import { calculateGasMargin } from 'utils';
import { MergedZap } from 'state/zap/actions';
import { useIsInfiniteApproval } from 'state/user/hooks';
import { TransactionType } from 'models/enums';

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const [isApproved, setApproved] = useState(false);
  const { account, chainId } = useActiveWeb3React();
  const token = amountToApprove?.currency?.isToken
    ? amountToApprove.currency
    : undefined;
  const currentAllowance = useV3TokenAllowance(
    token,
    account ?? undefined,
    spender,
  );
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    if (isApproved) return ApprovalState.APPROVED;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, pendingApproval, spender, isApproved]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();
  const [isInfiniteApproval] = useIsInfiniteApproval();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
      return;
    }
    if (!chainId) {
      console.error('no chainId');
      return;
    }

    if (!token) {
      console.error('no token');
      return;
    }

    if (!tokenContract) {
      console.error('tokenContract is null');
      return;
    }

    if (!amountToApprove) {
      console.error('missing amount to approve');
      return;
    }

    if (!spender) {
      console.error('no spender');
      return;
    }

    const approveAmount = isInfiniteApproval
      ? MaxUint256.toString()
      : amountToApprove.quotient.toString();

    let useExact = false;
    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, approveAmount)
      .catch(() => {
        // general fallback for tokens who restrict approval amounts
        useExact = true;
        return tokenContract.estimateGas.approve(
          spender,
          amountToApprove.quotient.toString(),
        );
      });

    return tokenContract
      .approve(
        spender,
        useExact || !isInfiniteApproval
          ? amountToApprove.quotient.toString()
          : approveAmount,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      )
      .then(async (response: TransactionResponse) => {
        addTransaction(response, {
          summary:
            `Approve ` + (amountToApprove.currency.symbol || `LP-tokens`),
          approval: { tokenAddress: token.address, spender: spender },
          type: TransactionType.APPROVED,
        });
        try {
          await response.wait();
          setApproved(true);
        } catch (e) {
          setApproved(false);
          console.debug('Failed to approve token', e);
          throw e;
        }
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error);
        // throw error
      });
  }, [
    approvalState,
    chainId,
    token,
    tokenContract,
    amountToApprove,
    spender,
    isInfiniteApproval,
    addTransaction,
  ]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade: V3Trade<Currency, Currency, TradeType> | undefined,
  allowedSlippage: Percent,
) {
  const { chainId } = useActiveWeb3React();
  const isUni = trade?.swaps[0]?.route?.pools[0]?.isUni;
  const v3SwapRouterAddress = chainId
    ? isUni
      ? UNI_SWAP_ROUTER[chainId]
      : SWAP_ROUTER_ADDRESSES[chainId]
    : undefined;
  const amountToApprove = useMemo(
    () =>
      trade && trade.inputAmount.currency.isToken
        ? trade.maximumAmountIn(allowedSlippage)
        : undefined,
    [trade, allowedSlippage],
  );
  return useApproveCallback(
    amountToApprove,
    chainId
      ? trade instanceof V3Trade
        ? v3SwapRouterAddress
        : undefined
      : undefined,
  );
}

export function useApproveCallbackFromZap(
  zap?: MergedZap,
): [ApprovalState, () => Promise<void>] {
  const { chainId } = useActiveWeb3React();

  const inAmount = zap?.currencyIn?.currency
    ? CurrencyAmount.fromRawAmount(
        zap?.currencyIn?.currency,
        zap.currencyIn?.inputAmount,
      )
    : undefined;

  const spender = chainId ? ZAP_ADDRESS[chainId] : undefined;

  return useApproveCallback(inAmount, spender);
}
