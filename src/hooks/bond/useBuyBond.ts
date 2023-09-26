import { useCallback } from 'react';
import { useBondType } from './useBondType';
import { useWeb3React } from '@web3-react/core';
import { useBondContract } from 'hooks/useContract';
import BigNumber from 'bignumber.js';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useTranslation } from 'react-i18next';

const DEFAULT_SLIPPAGE = 102; // Maximum of 2% slippage when buying Bill
// Buy a Bill
const useBuyBond = (
  billAddress: string,
  amount: string,
  lpPrice: number,
  price: string,
  principalTokenDecimals: number | null | undefined = 18,
  slippage = DEFAULT_SLIPPAGE,
) => {
  const { chainId, account } = useWeb3React();
  const { t } = useTranslation();
  const bondContract = useBondContract(billAddress);
  const billType: string | undefined = useBondType(billAddress);
  const usdAmount: number = parseFloat(amount) * lpPrice;
  const maxPrice = new BigNumber(price).times(slippage).div(100);
  const addTransaction = useTransactionAdder();
  const handleBuyBill = useCallback(async () => {
    if (!bondContract) return;
    const tx = await bondContract.deposit(
      new BigNumber(amount)
        .times(new BigNumber(10).pow(principalTokenDecimals ?? 18))
        .toString(),
      maxPrice.toFixed(0),
      account ?? '',
    );
    addTransaction(tx, {
      summary: t('buyBond'),
    });
    return tx.wait();
  }, [
    bondContract,
    amount,
    principalTokenDecimals,
    maxPrice,
    account,
    addTransaction,
    t,
  ]);

  return { onBuyBill: handleBuyBill };
};

export default useBuyBond;
