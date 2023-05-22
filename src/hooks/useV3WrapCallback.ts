import { WETH } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { useWETHContract } from './useContract';
import { formatTokenAmount } from 'utils';

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
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
  const wethContract = useWETHContract();
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency);
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [
    inputCurrency,
    typedValue,
  ]);
  const addTransaction = useTransactionAdder();

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency)
      return NOT_APPLICABLE;

    const sufficientBalance =
      inputAmount && balance && !balance.lessThan(inputAmount);

    if (
      inputCurrency.isNative &&
      outputCurrency.wrapped &&
      outputCurrency.wrapped.address &&
      outputCurrency.wrapped.address.toLowerCase() ===
        WETH[chainId].address.toLowerCase()
    ) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.deposit({
                    value: `0x${inputAmount.numerator.toString(16)}`,
                  });
                  addTransaction(txReceipt, {
                    summary: `Wrap ${inputAmount.toSignificant(2)} ETH to WETH`,
                  });
                } catch (error) {
                  console.error('Could not deposit', error);
                }
              }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient ETH balance',
      };
    } else if (
      inputCurrency.wrapped &&
      inputCurrency.wrapped.address &&
      WETH[chainId].address.toLowerCase() ===
        inputCurrency.wrapped.address.toLowerCase() &&
      outputCurrency.isNative
    ) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.withdraw(
                    `0x${inputAmount.numerator.toString(16)}`,
                  );
                  addTransaction(txReceipt, {
                    summary: `Unwrap ${inputAmount.toSignificant(
                      2,
                    )} WETH to ETH`,
                  });
                } catch (error) {
                  console.error('Could not withdraw', error);
                }
              }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient WETH balance',
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
    addTransaction,
  ]);
}
