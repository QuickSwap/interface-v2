import { useCallback } from 'react';
import { useBondType } from './useBondType';
import { useBondContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTranslation } from 'next-i18next';

// Claim a Bond
const useClaimBond = (billAddress: string, billIds: string[]) => {
  const { t } = useTranslation();
  const bondContract = useBondContract(billAddress);
  const billType = useBondType(billAddress);
  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();
  const handleClaimBill = useCallback(async () => {
    if (!bondContract) return;
    const tx = await bondContract.batchRedeem(billIds);
    addTransaction(tx, { summary: t('claimBond') ?? '' });
    const resp = await tx.wait();
    finalizeTransaction(resp, {
      summary: t('claimBond') ?? '',
    });
    return tx;
  }, [bondContract, billIds, addTransaction, finalizeTransaction, t]);

  return { onClaimBill: handleClaimBill, billType };
};

export default useClaimBond;
