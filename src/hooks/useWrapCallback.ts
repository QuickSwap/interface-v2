import {
  ChainId,
  Currency,
  currencyEquals,
  ETHER,
  Token,
  WETH,
} from '@uniswap/sdk';
import { useMemo, useState } from 'react';
import { tryParseAmount } from 'state/swap/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useWETHContract } from './useContract';
import { formatTokenAmount } from 'utils';
import { useAppDispatch } from 'state';
import { updateUserBalance } from 'state/balance/actions';
import { TransactionType } from 'models/enums';
import { ETHER as ETHER_CURRENCY } from 'constants/v3/addresses';

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
  WRAPPING,
  UNWRAPPING,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE };
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
): {
  wrapType: WrapType;
  execute?: undefined | (() => Promise<void>);
  inputError?: string;
} {
  const { chainId, account } = useActiveWeb3React();
  const chainIdToUse = chainId ? chainId : ChainId.MATIC;
  const nativeCurrency = ETHER[chainIdToUse];
  const wethContract = useWETHContract();
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency);
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(
    () => tryParseAmount(chainIdToUse, typedValue, inputCurrency),
    [chainIdToUse, inputCurrency, typedValue],
  );
  const addTransaction = useTransactionAdder();
  const [wrapping, setWrapping] = useState(false);
  const [unwrapping, setUnWrapping] = useState(false);
  const dispatch = useAppDispatch();
  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency)
      return NOT_APPLICABLE;

    const sufficientBalance =
      inputAmount && balance && !balance.lessThan(inputAmount);

    if (
      inputCurrency === nativeCurrency &&
      currencyEquals(WETH[chainId], outputCurrency)
    ) {
      return {
        wrapType: wrapping ? WrapType.WRAPPING : WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                setWrapping(true);
                try {
                  const txReceipt = await wethContract.deposit({
                    value: `0x${inputAmount.raw.toString(16)}`,
                  });
                  addTransaction(txReceipt, {
                    summary: `Wrap ${formatTokenAmount(inputAmount)} ${
                      ETHER[chainId].symbol
                    } to ${WETH[chainId].symbol}`,
                    type: TransactionType.WRAP,
                    tokens: [Token.ETHER[chainId]],
                  });
                  await txReceipt.wait();
                  dispatch(updateUserBalance());
                  setWrapping(false);
                } catch (error) {
                  setWrapping(false);
                  console.error('Could not deposit', error);
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : `Insufficient ${ETHER[chainId].symbol}`,
      };
    } else if (
      currencyEquals(WETH[chainId], inputCurrency) &&
      outputCurrency === nativeCurrency
    ) {
      return {
        wrapType: unwrapping ? WrapType.UNWRAPPING : WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                setUnWrapping(true);
                try {
                  const txReceipt = await wethContract.withdraw(
                    `0x${inputAmount.raw.toString(16)}`,
                  );
                  addTransaction(txReceipt, {
                    summary: `Unwrap ${formatTokenAmount(inputAmount)} ${
                      WETH[chainId].symbol
                    } to ${ETHER[chainId].symbol}`,
                    type: TransactionType.UNWRAP,
                    tokens: [Token.ETHER[chainId]],
                  });
                  await txReceipt.wait();
                  dispatch(updateUserBalance());
                  setUnWrapping(false);
                } catch (error) {
                  setUnWrapping(false);
                  console.error('Could not withdraw', error);
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : `Insufficient ${WETH[chainId].symbol}`,
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [
    wethContract,
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    nativeCurrency,
    wrapping,
    addTransaction,
    dispatch,
    unwrapping,
  ]);
}
