import { useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { useBondContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { TransactionResponse } from '@ethersproject/providers';

const DEFAULT_SLIPPAGE = 102; // Maximum of 2% slippage when buying Bill
// Buy a Bill
const useBuyBond = (
  billAddress: string,
  amount: string,
  price: string,
  principalTokenDecimals: number | null | undefined = 18,
  slippage = DEFAULT_SLIPPAGE,
) => {
  const { account } = useWeb3React();
  const { t } = useTranslation();
  const bondContract = useBondContract(billAddress);
  const maxPrice = price
    ? BigNumber.from(price)
        .mul(slippage)
        .div(100)
    : '0';
  const parsedAmount = parseUnits(
    Number(amount).toFixed(principalTokenDecimals ?? 18),
    principalTokenDecimals ?? 18,
  );
  const addTransaction = useTransactionAdder();
  const finalizeTransaction = useTransactionFinalizer();
  const handleBuyBond = useCallback(async () => {
    if (!bondContract) return;
    const tx: TransactionResponse = await bondContract.deposit(
      parsedAmount,
      maxPrice,
      account ?? '',
    );
    addTransaction(tx, {
      summary: t('buyBond'),
    });
    const resp = await tx.wait();
    finalizeTransaction(resp, {
      summary: t('buyBond'),
    });
  }, [
    bondContract,
    parsedAmount,
    maxPrice,
    account,
    addTransaction,
    t,
    finalizeTransaction,
  ]);

  return { onBuyBond: handleBuyBond };
};

export default useBuyBond;
