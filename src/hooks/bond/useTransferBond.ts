import { useCallback } from 'react';
import { useBondType } from './useBondType';
import { useWeb3React } from '@web3-react/core';
import { useBondNFTContract } from 'hooks/useContract';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useTranslation } from 'react-i18next';

const useTransferBond = (
  billNftAddress: string,
  billId: string,
  toAddress: string,
) => {
  const { account } = useWeb3React();
  const bondNftContract = useBondNFTContract(billNftAddress);
  const billType = useBondType(billNftAddress);
  const addTransaction = useTransactionAdder();
  const { t } = useTranslation();

  // TODO: Add handlers
  const handleTransfer = useCallback(async () => {
    if (!bondNftContract) return;
    try {
      const tx = await bondNftContract[
        'safeTransferFrom(address,address,uint256)'
      ](account ?? '', toAddress, billId);
      addTransaction(tx, { summary: t('transferBond') });
      return tx;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [bondNftContract, account, toAddress, billId, addTransaction, t]);
  return { onTransfer: handleTransfer };
};

export default useTransferBond;
