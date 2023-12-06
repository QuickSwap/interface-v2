import { useCallback } from 'react';
import { useBondType } from './useBondType';
import { useBondContract } from 'hooks/useContract';
import { useTransactionAdder } from 'state/transactions/hooks';

// Claim a Bond
const useClaimBond = (
  billAddress: string,
  billIds: string[],
  earnToken?: string,
) => {
  const bondContract = useBondContract(billAddress);
  const billType = useBondType(billAddress);
  const addTransaction = useTransactionAdder();
  const handleClaimBill = useCallback(async () => {
    if (!bondContract) return;
    const tx = await bondContract.batchRedeem(billIds);
    addTransaction(tx, { summary: 'Claim bond' });
    // if (earnToken?.toLowerCase() === 'banana' && !hideCircular) {
    //   router.push('?modal=circular-gh');
    // }
    return tx;
  }, [bondContract, billIds, addTransaction]);

  return { onClaimBill: handleClaimBill, billType };
};

export default useClaimBond;
