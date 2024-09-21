import {
  TransactionResponse,
  TransactionReceipt,
} from '@ethersproject/providers';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useActiveWeb3React } from 'hooks';
import { useAddPopup } from 'state/application/hooks';
import { AppDispatch, AppState } from 'state';
import { addTransaction, finalizeTransaction } from './actions';
import { TransactionDetails } from './reducer';
import { useArcxAnalytics } from '@arcxmoney/analytics';
import { Currency } from '@uniswap/sdk';

interface TransactionData {
  summary?: string;
  approval?: { tokenAddress: string; spender: string };
  claim?: { recipient: string };
  type?: string;
  tokens?: any[];
}

// helper that can take a ethers library transaction response and add it to the list of transactions
export function useTransactionAdder(): (
  response?: TransactionResponse,
  customData?: TransactionData,
  txHash?: string,
) => void {
  const { chainId, account } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const arcxSDK = useArcxAnalytics();

  return useCallback(
    async (
      response?: TransactionResponse,
      {
        summary,
        approval,
        claim,
        type,
        tokens,
      }: {
        summary?: string;
        claim?: { recipient: string };
        approval?: { tokenAddress: string; spender: string };
        type?: string;
        tokens?: any[];
      } = {},
      txHash?: string,
    ) => {
      if (!account || !chainId) return;
      const hash = response ? response.hash : txHash;

      if (!hash) {
        throw Error('No transaction hash found.');
      }
      if (arcxSDK) {
        await arcxSDK.transaction({
          chainId,
          account,
          transactionHash: hash,
          metadata: {
            action: summary,
          },
        });
      }
      dispatch(
        addTransaction({
          hash,
          from: account,
          chainId,
          approval,
          summary,
          claim,
          type,
          tokens,
        }),
      );
    },
    [account, arcxSDK, chainId, dispatch],
  );
}

export function useTransactionFinalizer(): (
  receipt: TransactionReceipt,
  customData?: {
    summary?: string;
    approval?: { tokenAddress: string; spender: string };
    claim?: { recipient: string };
    type?: string;
  },
) => void {
  const { chainId, account } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const addPopup = useAddPopup();

  return useCallback(
    (
      receipt: TransactionReceipt,
      {
        summary,
        type,
      }: {
        summary?: string;
        claim?: { recipient: string };
        approval?: { tokenAddress: string; spender: string };
        type?: string;
      } = {},
    ) => {
      if (!account) return;
      if (!chainId) return;

      const { transactionHash } = receipt;
      if (!transactionHash) {
        throw Error('No transaction hash found.');
      }
      dispatch(
        finalizeTransaction({
          chainId,
          hash: transactionHash,
          receipt: {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            contractAddress: receipt.contractAddress,
            from: receipt.from,
            status: receipt.status,
            to: receipt.to,
            transactionHash: receipt.transactionHash,
            transactionIndex: receipt.transactionIndex,
          },
        }),
      );
      addPopup(
        {
          txn: {
            hash: transactionHash,
            success: receipt.status === 1,
            summary: summary,
          },
        },
        transactionHash,
      );
    },
    [dispatch, chainId, account, addPopup],
  );
}

// returns all the transactions for the current chain
export function useAllTransactions(): { [txHash: string]: TransactionDetails } {
  const { chainId } = useActiveWeb3React();

  const state = useSelector<AppState, AppState['transactions']>(
    (state) => state.transactions,
  );

  return chainId ? state[chainId] ?? {} : {};
}

export function useIsTransactionPending(transactionHash?: string): boolean {
  const transactions = useAllTransactions();

  if (!transactionHash || !transactions[transactionHash]) return false;

  return !transactions[transactionHash].receipt;
}

/**
 * Returns whether a transaction happened in the last day (86400 seconds * 1000 milliseconds / second)
 * @param tx to check for recency
 */
export function isTransactionRecent(tx: TransactionDetails): boolean {
  return new Date().getTime() - tx.addedTime < 86_400_000;
}

// returns whether a token has a pending approval transaction
export function useHasPendingApproval(
  tokenAddress: string | undefined,
  spender: string | undefined,
): boolean {
  const allTransactions = useAllTransactions();
  return useMemo(
    () =>
      typeof tokenAddress === 'string' &&
      typeof spender === 'string' &&
      Object.keys(allTransactions).some((hash) => {
        const tx = allTransactions[hash];
        if (!tx) return false;
        if (tx.receipt) {
          return false;
        } else {
          const approval = tx.approval;
          if (!approval) return false;
          return (
            approval.spender === spender &&
            approval.tokenAddress === tokenAddress &&
            isTransactionRecent(tx)
          );
        }
      }),
    [allTransactions, spender, tokenAddress],
  );
}

// watch for submissions to claim
// return null if not done loading, return undefined if not found
export function useUserHasSubmittedClaim(
  account?: string,
): { claimSubmitted: boolean; claimTxn: TransactionDetails | undefined } {
  const allTransactions = useAllTransactions();

  // get the txn if it has been submitted
  const claimTxn = useMemo(() => {
    const txnIndex = Object.keys(allTransactions).find((hash) => {
      const tx = allTransactions[hash];
      return tx.claim && tx.claim.recipient === account;
    });
    return txnIndex && allTransactions[txnIndex]
      ? allTransactions[txnIndex]
      : undefined;
  }, [account, allTransactions]);

  return { claimSubmitted: Boolean(claimTxn), claimTxn };
}

export function useLastTransactionHash() {
  const allTransactions = useAllTransactions();
  const sortedTransactions = Object.values(allTransactions)
    .sort((a, b) => b.addedTime - a.addedTime)
    .filter((tx) => tx.receipt);
  return sortedTransactions.length > 0 ? sortedTransactions[0].hash : '';
}

export const useSignTransaction = () => {
  const { provider } = useActiveWeb3React();

  const addTransaction = useTransactionAdder();

  const signTransaction = async ({
    dataToSign,
    txInfo,
  }: {
    dataToSign: any;
    txInfo: TransactionData;
  }): Promise<string | undefined> => {
    const tx = await provider?.getSigner().sendTransaction(dataToSign);
    if (tx) {
      addTransaction(tx, txInfo);
    }
    return tx?.hash;
  };
  return { signTransaction };
};
