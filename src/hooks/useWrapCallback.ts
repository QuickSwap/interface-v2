import { ChainId, Currency, currencyEquals, ETHER, WETH } from '@uniswap/sdk';
import {
  Token as V3Token,
  NativeCurrency,
  Currency as V3Currency,
} from '@uniswap/sdk-core';
import { useMemo } from 'react';
import { tryParseAmount } from 'state/swap/hooks';
import { useTransactionAdder } from 'state/transactions/hooks';
import { useCurrencyBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { useWETHContract } from './useContract';
import { formatTokenAmount } from 'utils';
import { toV3Token } from 'constants/v3/addresses';
import { useIsV2 } from 'state/application/hooks';

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
  const { isV2 } = useIsV2();
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

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency)
      return NOT_APPLICABLE;

    const sufficientBalance =
      inputAmount && balance && !balance.lessThan(inputAmount);

    const wETHV3 = toV3Token({
      chainId,
      address: WETH[chainId].address,
      decimals: WETH[chainId].decimals,
      symbol: WETH[chainId].symbol,
      name: WETH[chainId].name,
    });

    if (
      isV2
        ? inputCurrency === nativeCurrency &&
          currencyEquals(WETH[chainId], outputCurrency)
        : (inputCurrency as V3Currency).isNative &&
          wETHV3.address.toLowerCase() ===
            (outputCurrency as V3Token).address.toLowerCase()
    ) {
      return {
        wrapType: WrapType.WRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.deposit({
                    value: `0x${inputAmount.raw.toString(16)}`,
                  });
                  addTransaction(txReceipt, {
                    summary: `Wrap ${formatTokenAmount(
                      inputAmount,
                    )} ETH to WETH`,
                  });
                } catch (error) {
                  console.error('Could not deposit', error);
                }
              }
            : undefined,
        inputError: sufficientBalance ? undefined : 'Insufficient ETH balance',
      };
    } else if (
      isV2
        ? currencyEquals(WETH[chainId], inputCurrency) &&
          outputCurrency === nativeCurrency
        : wETHV3.address.toLowerCase() ===
            (inputCurrency as V3Token).address.toLowerCase() &&
          (outputCurrency as V3Currency).isNative
    ) {
      return {
        wrapType: WrapType.UNWRAP,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  const txReceipt = await wethContract.withdraw(
                    `0x${inputAmount.raw.toString(16)}`,
                  );
                  addTransaction(txReceipt, {
                    summary: `Unwrap ${formatTokenAmount(
                      inputAmount,
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
    nativeCurrency,
    addTransaction,
    isV2,
  ]);
}
