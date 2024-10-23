import { useCallback } from 'react';
import { useBondNFTContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTranslation } from 'react-i18next';
import { useActiveWeb3React } from 'hooks';
import { TransactionType } from 'models/enums';

const useTransferBond = (
  billNftAddress: string,
  billId: string,
  toAddress: string,
) => {
  const { account } = useActiveWeb3React();
  const bondNftContract = useBondNFTContract(billNftAddress);
  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();
  const { t } = useTranslation();

  const handleTransfer = useCallback(async () => {
    if (!bondNftContract) return;
    try {
      const tx = await bondNftContract[
        'safeTransferFrom(address,address,uint256)'
      ](account ?? '', toAddress, billId);
      addTransaction(tx, {
        summary: t('transferBond'),
        type: TransactionType.TRANSFER_BOND,
      });
      const resp = await tx.wait();
      finalizeTransaction(resp, {
        summary: t('transferBond'),
      });
      return tx;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [
    bondNftContract,
    account,
    toAddress,
    billId,
    addTransaction,
    t,
    finalizeTransaction,
  ]);
  return { onTransfer: handleTransfer };
};

export default useTransferBond;
