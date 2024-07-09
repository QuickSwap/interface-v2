import { TransactionResponse } from '@ethersproject/providers';
import {
  Trade,
  TokenAmount,
  CurrencyAmount,
  ETHER,
  Fraction,
  Percent,
  ChainId,
} from '@uniswap/sdk';
import {
  CurrencyAmount as CurrencyAmountV3,
  Currency,
  MaxUint256,
} from '@uniswap/sdk-core';
import { useCallback, useState, useMemo } from 'react';
import { useTokenAllowance, useV3TokenAllowance } from './useTokenAllowance';
import { Field } from 'state/swap/actions';
import {
  useTransactionAdder,
  useHasPendingApproval,
} from 'state/transactions/hooks';
import { computeSlippageAdjustedAmounts } from 'utils/prices';
import { calculateGasMargin, calculateGasMarginBonus } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { useTokenContract } from './useContract';
import {
  PARASWAP_PROXY_ROUTER_ADDRESS,
  V2_ROUTER_ADDRESS,
  SWAP_ROUTER_ADDRESS,
} from 'constants/v3/addresses';
import { OptimalRate } from '@paraswap/sdk';
import { ONE } from 'v3lib/utils';
import { useIsInfiniteApproval } from 'state/user/hooks';

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string,
): [ApprovalState, () => Promise<void>] {
  const [isApproved, setApproved] = useState(false);
  const { account, chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
  const token =
    amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined;
  const currentAllowance = useTokenAllowance(
    token,
    account ?? undefined,
    spender,
  );
  const pendingApproval = useHasPendingApproval(token?.address, spender);

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
    if (amountToApprove.currency === nativeCurrency)
      return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    if (isApproved) return ApprovalState.APPROVED;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [
    amountToApprove,
    currentAllowance,
    nativeCurrency,
    pendingApproval,
    spender,
    isApproved,
  ]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();

  const [isInfiniteApproval] = useIsInfiniteApproval();

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily');
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
      : amountToApprove.raw.toString();

    let useExact = false;
    const estimatedGas = await tokenContract.estimateGas
      .approve(spender, approveAmount)
      .catch(() => {
        // general fallback for tokens who restrict approval amounts
        useExact = true;
        return tokenContract.estimateGas.approve(
          spender,
          amountToApprove.raw.toString(),
        );
      });

    return tokenContract
      .approve(
        spender,
        useExact || !isInfiniteApproval
          ? amountToApprove.raw.toString()
          : approveAmount,
        {
          gasLimit: calculateGasMargin(estimatedGas),
        },
      )
      .then(async (response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
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
        throw error;
      });
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    isInfiniteApproval,
    addTransaction,
  ]);

  return [approvalState, approve];
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallbackV3(
  amountToApprove?: CurrencyAmountV3<Currency>,
  spender?: string,
  isBonusRoute?: boolean,
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
          gasLimit: isBonusRoute
            ? calculateGasMarginBonus(estimatedGas)
            : calculateGasMargin(estimatedGas),
        },
      )
      .then(async (response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender },
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
    isBonusRoute,
    addTransaction,
  ]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade?: Trade,
  allowedSlippage = 0,
): [ApprovalState, () => Promise<void>] {
  const { chainId } = useActiveWeb3React();

  const amountToApprove = useMemo(
    () =>
      trade
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT]
        : undefined,
    [trade, allowedSlippage],
  );

  return useApproveCallback(
    amountToApprove,
    chainId ? V2_ROUTER_ADDRESS[chainId] : undefined,
  );
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromBestTrade(
  allowedSlippage: Percent,
  currency?: Currency,
  optimalRate?: OptimalRate | null,
  bonusRouteFound?: boolean,
  atMaxAmountInput?: boolean,
): [ApprovalState, () => Promise<void>] {
  const { chainId } = useActiveWeb3React();

  const amountToApprove = useMemo(
    () =>
      optimalRate
        ? atMaxAmountInput
          ? new Fraction(ONE).multiply(optimalRate.srcAmount).quotient
          : new Fraction(ONE)
              .add(allowedSlippage)
              .multiply(optimalRate.srcAmount).quotient
        : undefined,
    [optimalRate, allowedSlippage, atMaxAmountInput],
  );

  const approveAmount =
    amountToApprove && currency
      ? CurrencyAmountV3.fromRawAmount(currency, amountToApprove)
      : undefined;

  return useApproveCallbackV3(
    approveAmount,
    chainId
      ? bonusRouteFound
        ? SWAP_ROUTER_ADDRESS[chainId]
        : PARASWAP_PROXY_ROUTER_ADDRESS[chainId]
      : undefined,
    bonusRouteFound,
  );
}
