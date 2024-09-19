import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useTokenContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { TransactionType } from 'models/enums';

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
      summary: t('approveBond'),
      approval: {
        tokenAddress: tokenAddress,
        spender: bondAddress,
      },
      type: TransactionType.APPROVED,
    });
    const resp = await trx.wait();
    finalizeTransaction(resp, {
      summary: t('approveBond'),
      approval: {
        tokenAddress: tokenAddress,
        spender: bondAddress,
      },
      type: TransactionType.APPROVED,
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
