import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useTokenContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { useTranslation } from 'next-i18next';

// Approve a bond
const useApproveBond = (tokenAddress: string, bondAddress: string) => {
  const tokenContract = useTokenContract(tokenAddress);
  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();
  const { t } = useTranslation();

  const handleApprove = useCallback(async () => {
    if (!tokenContract) return;
    const trx: TransactionResponse = await tokenContract?.approve(
      bondAddress,
      ethers.constants.MaxUint256,
    );
    addTransaction(trx, {
      summary: t('approveBond') ?? '',
      approval: {
        tokenAddress: tokenAddress,
        spender: bondAddress,
      },
    });
    const resp = await trx.wait();
    finalizeTransaction(resp, {
      summary: t('approveBond') ?? '',
      approval: {
        tokenAddress: tokenAddress,
        spender: bondAddress,
      },
    });
  }, [
    tokenContract,
    bondAddress,
    addTransaction,
    t,
    tokenAddress,
    finalizeTransaction,
  ]);
  return { onApprove: handleApprove };
};

export default useApproveBond;
