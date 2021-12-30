import { MaxUint256 } from '@ethersproject/constants';
import { TransactionResponse } from '@ethersproject/providers';
import { Trade, TokenAmount, CurrencyAmount, ETHER } from '@uniswap/sdk';
import { useCallback, useMemo } from 'react';
import {
  ROUTER_ADDRESS,
  EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE1,
  EIP712_SUPPORTED_TOKENS_DOMAIN_TYPE2,
  PERMIT_ONLY_SUPPORTED_TOKENS,
  EIP2771_SUPPORTED_TOKENS,
  domainType1,
  domainType2,
  domainType3,
  eip2612PermitType,
} from 'constants/index';
import { useTokenAllowance } from 'data/Allowances';
import { Field } from 'state/swap/actions';
import {
  useTransactionAdder,
  useHasPendingApproval,
} from 'state/transactions/hooks';
import { computeSlippageAdjustedAmounts } from 'utils/prices';
import { calculateGasMargin } from 'utils';
import { useActiveWeb3React } from 'hooks';
import { splitSignature } from '@ethersproject/bytes';
import { useTokenContract } from './useContract';
import { useIsGaslessEnabled } from 'state/application/hooks';
import { useBiconomy } from 'context/Biconomy';

import metaTokens from 'config/biconomy/metaTokens';
import { ethers } from 'ethers';

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
  const { account, chainId, library } = useActiveWeb3React();
  const gaslessMode = useIsGaslessEnabled();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { biconomy, isBiconomyReady } = useBiconomy()!;

  if (!chainId) throw new Error('Error');
  if (!library) throw new Error('Error');

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
    if (amountToApprove.currency === ETHER) return ApprovalState.APPROVED;
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN;

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED;
  }, [amountToApprove, currentAllowance, pendingApproval, spender]);

  const tokenContract = useTokenContract(token?.address);
  const addTransaction = useTransactionAdder();

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

    const matchingMetaToken = metaTokens.find(
      (t) => t.token.address.toLowerCase() === token.address.toLowerCase(),
    );

    if (gaslessMode && matchingMetaToken) {
      if (!account) throw new Error('Account not found, user not logged in?');
      matchingMetaToken.init(library, biconomy, account);
      if (!matchingMetaToken.approve)
        throw new Error('Gasless not working, try normally');

      return matchingMetaToken
        .approve(spender, chainId)
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + amountToApprove.currency.symbol,
            approval: { tokenAddress: token.address, spender: spender },
          });
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error);
          throw error;
        });
    } else {
      let useExact = false;
      const estimatedGas = await tokenContract.estimateGas
        .approve(spender, MaxUint256)
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
          useExact ? amountToApprove.raw.toString() : MaxUint256,
          {
            gasLimit: calculateGasMargin(estimatedGas),
          },
        )
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + amountToApprove.currency.symbol,
            approval: { tokenAddress: token.address, spender: spender },
          });
        })
        .catch((error: Error) => {
          console.debug('Failed to approve token', error);
          throw error;
        });
    }
  }, [
    approvalState,
    token,
    tokenContract,
    amountToApprove,
    spender,
    addTransaction,
    chainId,
    gaslessMode,
    library,
    account,
    biconomy,
  ]);

  return [approvalState, approve];
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(
  trade?: Trade,
  allowedSlippage = 0,
): [ApprovalState, () => Promise<void>] {
  const amountToApprove = useMemo(
    () =>
      trade
        ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT]
        : undefined,
    [trade, allowedSlippage],
  );

  return useApproveCallback(amountToApprove, ROUTER_ADDRESS);
}
