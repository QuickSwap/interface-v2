import { useCallback } from 'react';
import { ethers } from 'ethers';
import { useTokenContract } from 'hooks/useContract';
import { useTransactionAdder } from 'state/transactions/hooks';
import { TransactionResponse } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';

// Approve a bond
const useApproveBond = (tokenAddress: string, bondAddress: string) => {
  const tokenContract = useTokenContract(tokenAddress);
  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();

  const handleApprove = useCallback(async () => {
    const tx = await tokenContract
      ?.approve(bondAddress, ethers.constants.MaxUint256)
      .then((trx: TransactionResponse) => {
        addTransaction(trx, {
          summary: t('approveBond'),
          approval: {
            tokenAddress: tokenAddress,
            spender: bondAddress,
          },
        });
        return trx.wait();
      });
    return tx;
  }, [bondAddress, t, addTransaction, tokenAddress, tokenContract]);
  return { onApprove: handleApprove };
};

export default useApproveBond;
