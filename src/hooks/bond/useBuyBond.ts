import { useCallback } from 'react';
import { useBondContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { TransactionResponse } from '@ethersproject/providers';
import { useActiveWeb3React } from 'hooks';
import { getFixedValue } from 'utils';
import { TransactionType } from 'models/enums';

const DEFAULT_SLIPPAGE = 102; // Maximum of 2% slippage when buying Bill
// Buy a Bill
const useBuyBond = (
  billAddress: string,
  amount: string,
  price: string,
  principalTokenDecimals: number | null | undefined = 18,
  slippage = DEFAULT_SLIPPAGE,
) => {
  const { account } = useActiveWeb3React();
  const { t } = useTranslation();
  const bondContract = useBondContract(billAddress);
  const maxPrice = price
    ? BigNumber.from(price)
        .mul(slippage)
        .div(100)
    : '0';
  const parsedAmount = parseUnits(
    getFixedValue(amount, principalTokenDecimals ?? 18),
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
      type: TransactionType.SEND,
    });
    const resp = await tx.wait();
    finalizeTransaction(resp, {
      summary: t('buyBond'),
    });
    return resp;
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
