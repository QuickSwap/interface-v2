import { ETHER } from '@uniswap/sdk';
import { Currency } from '@uniswap/sdk-core';
import { useMemo, useState } from 'react';
import { tryParseAmount } from 'state/swap/v3/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useCurrencyBalance } from 'state/wallet/v3/hooks';
import { useActiveWeb3React } from 'hooks';
import { useNativeConverterContract } from './useContract';
import { USDC, USDCE } from 'constants/v3/addresses';
import { calculateGasMargin } from 'utils';

export enum ConvertType {
  NOT_APPLICABLE,
  CONVERT,
  CONVERTING,
}

const NOT_APPLICABLE = { convertType: ConvertType.NOT_APPLICABLE };
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useNativeConvertCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined,
): {
  convertType: ConvertType;
  execute?: undefined | (() => Promise<void>);
  inputError?: string;
} {
  const { chainId, account } = useActiveWeb3React();
  const converterContract = useNativeConverterContract();
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency);
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [
    inputCurrency,
    typedValue,
  ]);
  const addTransaction = useTransactionAdder();
  const [converting, setConverting] = useState(false);

  return useMemo(() => {
    if (
      !converterContract ||
      !chainId ||
      !account ||
      !inputCurrency ||
      !outputCurrency ||
      !USDC[chainId] ||
      !USDCE[chainId]
    )
      return NOT_APPLICABLE;

    if (!inputAmount)
      return {
        convertType: ConvertType.NOT_APPLICABLE,
        inputError: 'Enter an amount',
      };

    const sufficientBalance =
      inputAmount && balance && !balance.lessThan(inputAmount);

    if (
      inputCurrency.isToken &&
      inputCurrency.address.toLowerCase() ===
        USDC[chainId].address.toLowerCase() &&
      outputCurrency.isToken &&
      outputCurrency.address.toLowerCase() ===
        USDCE[chainId].address.toLowerCase()
    ) {
      return {
        convertType: converting ? ConvertType.CONVERTING : ConvertType.CONVERT,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                setConverting(true);
                try {
                  const estimatedGas = await converterContract.estimateGas.convert(
                    account,
                    inputAmount.numerator.toString(),
                    '0x',
                  );
                  const txReceipt = await converterContract.convert(
                    account,
                    inputAmount.numerator.toString(),
                    '0x',
                    {
                      gasLimit: calculateGasMargin(estimatedGas),
                    },
                  );
                  addTransaction(txReceipt, {
                    summary: `Convert ${inputAmount.toSignificant(
                      2,
                    )} old USDC to new USDC`,
                  });
                  await txReceipt.wait();
                  setConverting(false);
                } catch (error) {
                  setConverting(false);
                  console.error('Could not convert', error);
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : `Insufficient ${ETHER[chainId].symbol}`,
      };
    } else {
      return NOT_APPLICABLE;
    }
  }, [
    converterContract,
    chainId,
    account,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    converting,
    addTransaction,
  ]);
}
