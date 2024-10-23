import { useCallback } from 'react';
import { useBondType } from './useBondType';
import { useBondContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTranslation } from 'react-i18next';
import { TransactionType } from 'models/enums';

// Claim a Bond
const useClaimBond = (
  billAddress: string,
  billIds: string[],
  earnToken?: string,
) => {
  const { t } = useTranslation();
  const bondContract = useBondContract(billAddress);
  const billType = useBondType(billAddress);
  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();
  const handleClaimBill = useCallback(async () => {
    if (!bondContract) return;
    const tx = await bondContract.batchRedeem(billIds);
    addTransaction(tx, {
      summary: t('claimBond'),
      type: TransactionType.CLAIM_BOND,
    });
    const resp = await tx.wait();
    finalizeTransaction(resp, {
      summary: t('claimBond'),
    });
    return tx;
  }, [bondContract, billIds, addTransaction, finalizeTransaction, t]);

  return { onClaimBill: handleClaimBill, billType };
};

export default useClaimBond;
